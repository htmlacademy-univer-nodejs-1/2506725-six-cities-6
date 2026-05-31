import { inject, injectable } from 'inversify';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  PathTransformer,
  PathTransformerMiddleware,
  PrivateRouteMiddleware,
  UploadFileMiddleware,
  UploadMultipleFilesMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectMiddleware,
} from '../../libs/rest/index.js';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { Response, Request } from 'express';
import { CreateOfferDto, OfferService, UpdateOfferDto } from './index.js';
import { fillDTO, getId } from '../../helpers/common.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { CreateOfferRequest } from './requests/create-offer-request.type.js';
import { PatchOfferRequest } from './requests/patch-offer-request.type.js';
import { UserService } from '../user/user-service.interface.ts';
import { StatusCodes } from 'http-status-codes';
import { Config } from '../../libs/config/config.interface.ts';
import { RestSchema } from '../../libs/config/index.ts';
import { OfferCityEnum, OfferCityType } from '../../types/index.ts';

const parseOfferLimit = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      'Параметр limit должен быть положительным целым числом',
      'OfferController'
    );
  }

  return limit;
};

const isOfferCity = (value: unknown): value is OfferCityType =>
  typeof value === 'string' &&
  (Object.values(OfferCityEnum) as string[]).includes(value);

@injectable()
export class OfferController extends BaseController {
  private readonly pathTransformerMiddleware: PathTransformerMiddleware;

  constructor(
        @inject(Component.Logger) protected readonly logger: Logger,
        @inject(Component.OfferService) private readonly offerService: OfferService,
        @inject(Component.UserService) private readonly userService: UserService,
        @inject(Component.PathTransformer) pathTransformer: PathTransformer,
        @inject(Component.Config) private readonly configService: Config<RestSchema>
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController…');

    this.pathTransformerMiddleware = new PathTransformerMiddleware(
      pathTransformer
    );

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [this.pathTransformerMiddleware],
    });

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new PrivateRouteMiddleware(), new ValidateDtoMiddleware(CreateOfferDto)],
    });

    this.addRoute({
      path: '/premium',
      method: HttpMethod.Get,
      handler: this.getPremium,
      middlewares: [this.pathTransformerMiddleware],
    });

    this.addRoute({
      path: '/me/favorites',
      method: HttpMethod.Get,
      handler: this.favorites,
      middlewares: [
        new PrivateRouteMiddleware(),
        this.pathTransformerMiddleware,
      ],
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.get,
      middlewares: [
        this.pathTransformerMiddleware,
        new ValidateObjectMiddleware('offerId'),
        new DocumentExistsMiddleware(offerService, 'Offer', 'offerId')
      ],
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.patch,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(offerService, 'Offer', 'offerId')
      ],
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectMiddleware('offerId'),
        new DocumentExistsMiddleware(offerService, 'Offer', 'offerId')
      ],
    });

    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Post,
      handler: this.postFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectMiddleware('offerId'),
        new DocumentExistsMiddleware(offerService, 'Offer', 'offerId')
      ]
    });

    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.deleteFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectMiddleware('offerId'),
        new DocumentExistsMiddleware(offerService, 'Offer', 'offerId')
      ]
    });

    this.addRoute({
      path: '/:offerId/preview',
      method: HttpMethod.Post,
      handler: this.uploadPreview,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectMiddleware('offerId'),
        new DocumentExistsMiddleware(offerService, 'Offer', 'offerId'),
        new UploadFileMiddleware(
          this.configService.get('UPLOAD_DIRECTORY'),
          'preview'
        ),
      ],
    });
    this.addRoute({
      path: '/:offerId/images',
      method: HttpMethod.Post,
      handler: this.uploadImages,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectMiddleware('offerId'),
        new DocumentExistsMiddleware(offerService, 'Offer', 'offerId'),
        new UploadMultipleFilesMiddleware(
          this.configService.get('UPLOAD_DIRECTORY'),
          'images',
          6
        ),
      ],
    });
  }

  private getOfferRdoData(offer: { toObject: () => Record<string, unknown> }) {
    const offerObject = offer.toObject();

    return {
      ...offerObject,
      id: String(offerObject._id),
    };
  }

  private async assertOfferAuthor(offerId: string, userId: string): Promise<void> {
    const offer = await this.offerService.findByOfferId(offerId);

    if (!offer || offer.authorId !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Можно редактировать или удалять только свои предложения',
        'OfferController'
      );
    }
  }

  private async getFavoriteIds(req: Request): Promise<string[]> {
    if (!req.tokenPayload) {
      return [];
    }

    return this.userService.getFavoriteIds(req.tokenPayload.id);
  }

  private withFavoriteFlag(
    offer: { toObject: () => Record<string, unknown> },
    favoriteIds: string[]
  ) {
    const offerObject = this.getOfferRdoData(offer);
    const { id } = offerObject;

    return {
      ...offerObject,
      isFavorite: typeof id === 'string' && favoriteIds.includes(id),
    };
  }

  public async index(req: Request, res: Response): Promise<void> {
    const offers = await this.offerService.find(parseOfferLimit(req.query.limit));
    const favoriteIds = await this.getFavoriteIds(req);
    const offersWithFavoritesFlag = offers.map((offer) =>
      this.withFavoriteFlag(offer, favoriteIds)
    );
    const responseData = fillDTO(OfferRdo, offersWithFavoritesFlag);
    this.ok(res, responseData);
  }

  public async create(
    req: CreateOfferRequest,
    res: Response
  ): Promise<void> {
    const existOffer = await this.offerService.findByOfferName(req.body.name);

    if (existOffer) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Предложение ${req.body.name}» существует.`,
        'OfferController'
      );
    }
    const result = await this.offerService.create({
      ...req.body,
      authorId: req.tokenPayload.id,
    });
    this.created(res, fillDTO(OfferRdo, this.getOfferRdoData(result)));
  }

  public async get(req: Request, res: Response): Promise<void> {
    this.logger.info('req.params:', req.params);
    this.logger.info('req.url:', req.url);
    const id = getId(req.params);
    const offer = await this.offerService.findByOfferId(id);
    const favoriteIds = await this.getFavoriteIds(req);
    const responseData = fillDTO(
      OfferRdo,
      offer ? this.withFavoriteFlag(offer, favoriteIds) : offer
    );
    this.ok(res, responseData);
  }

  public async patch(req: PatchOfferRequest, res: Response): Promise<void> {
    const id = getId(req.params);
    await this.assertOfferAuthor(id, req.tokenPayload.id);
    const result = await this.offerService.updateById(id, req.body);
    const responseData = fillDTO(OfferRdo, result ? this.getOfferRdoData(result) : result);
    this.ok(res, responseData);
  }

  public async delete(req: PatchOfferRequest, res: Response): Promise<void> {
    const id = getId(req.params);
    await this.assertOfferAuthor(id, req.tokenPayload.id);
    await this.offerService.deleteById(id);
    this.noContent(res);
  }

  public async getPremium(req: Request, res: Response): Promise<void> {
    const { city } = req.query;

    if (!isOfferCity(city)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Параметр city должен быть одним из городов: Paris, Cologne, Brussels, Amsterdam, Hamburg, Dusseldorf',
        'OfferController'
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    const favoriteIds = await this.getFavoriteIds(req);
    const responseData = fillDTO(
      OfferRdo,
      offers.map((offer) => this.withFavoriteFlag(offer, favoriteIds))
    );
    this.ok(res, responseData);
  }

  public async postFavorite(req: Request, res: Response): Promise<void> {
    const offerId = getId(req.params);
    await this.userService.addFavorite(req.tokenPayload.id, offerId);
    return this.ok(res, { message: 'Оффер добавлен в избранное' });
  }

  public async deleteFavorite(req: Request, res: Response): Promise<void> {
    const offerId = getId(req.params);
    await this.userService.deleteFavorite(req.tokenPayload.id, offerId);
    return this.ok(res, { message: 'Оффер удален из избранного' });
  }

  public async favorites(req: Request, res: Response): Promise<void> {
    const result = await this.userService.getFavorites(req.tokenPayload.id);
    const responseData = fillDTO(
      OfferRdo,
      result.map((offer) => ({
        ...this.getOfferRdoData(offer as { toObject: () => Record<string, unknown> }),
        isFavorite: true,
      }))
    );
    this.ok(res, responseData);
  }

  public async uploadPreview({ params, file, tokenPayload }: Request, res: Response) {
    if (!file || typeof params.offerId !== 'string') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Preview image is required',
        'OfferController'
      );
    }

    await this.assertOfferAuthor(params.offerId, tokenPayload.id);

    const updateDto = { preview: file.filename };
    const result = await this.offerService.updateById(
      params.offerId,
      updateDto
    );

    this.created(res, fillDTO(OfferRdo, result ? this.getOfferRdoData(result) : result));
  }

  public async uploadImages({ params, files, tokenPayload }: Request, res: Response) {
    const uploadedFiles = files as Express.Multer.File[];
    if (
      !uploadedFiles ||
            uploadedFiles.length === 0 ||
            typeof params.offerId !== 'string'
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'No images provided',
        'OfferController'
      );
    }

    await this.assertOfferAuthor(params.offerId, tokenPayload.id);

    const offer = await this.offerService.findByOfferId(params.offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer ${params.offerId} not found`,
        'OfferController'
      );
    }

    const currentImagesCount = offer.images.length;
    const newImagesCount = uploadedFiles.length;

    if (currentImagesCount + newImagesCount > 6) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Cannot upload ${newImagesCount} images. Current: ${currentImagesCount}, max: 6`,
        'OfferController'
      );
    }

    const newImageFilenames = uploadedFiles.map((file) => file.filename);
    const updatedImages = [...offer.images, ...newImageFilenames];

    const updateDto = { images: updatedImages };
    const result = await this.offerService.updateById(
      params.offerId,
      updateDto
    );

    this.created(res, fillDTO(OfferRdo, result ? this.getOfferRdoData(result) : result));
  }
}
