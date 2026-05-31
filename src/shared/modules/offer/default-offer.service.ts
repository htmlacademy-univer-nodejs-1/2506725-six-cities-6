import { DocumentType, types } from '@typegoose/typegoose';
import { inject } from 'inversify';
import { Component } from '../../types/index.js';
import { OfferService } from './offer-service.interface.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { Logger } from '../../libs/logger/index.js';
import { CommentEntity } from '../comments/index.js';
import { UserEntity } from '../user/index.js';
import { SortType } from '../../types/sort-type.enum.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DeleteResult } from 'mongoose';
import { DEFAULT_OFFER_COUNT, DEFAULT_PREMIUM_OFFER_COUNT } from './offer.constant.js';

export class DefaultOfferService implements OfferService {
  constructor(
        @inject(Component.Logger) private readonly logger: Logger,
        @inject(Component.OfferModel)
        private readonly offerModel: types.ModelType<OfferEntity>,
        @inject(Component.CommentModel)
        private readonly commentModel: types.ModelType<CommentEntity>,
        @inject(Component.UserModel)
        private readonly userModel: types.ModelType<UserEntity>
  ) { }

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create({
      ...dto,
      rating: 0,
    });
    this.logger.info(`New offer created: ${dto.name}`);
    return result;
  }

  public async findByOfferId(
    offerId: string
  ): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).exec();
  }

  public async findByOfferName(
    offerName: string
  ): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findOne({ name: offerName }).exec();
  }

  public async findByOfferNameOrCreate(
    offerName: string,
    dto: CreateOfferDto
  ): Promise<DocumentType<OfferEntity>> {
    const existedOffer = await this.findByOfferName(offerName);

    if (existedOffer) {
      return existedOffer;
    }

    return this.create(dto);
  }

  public async find(limit = DEFAULT_OFFER_COUNT): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({})
      .sort({ date: SortType.Desc })
      .limit(limit)
      .exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    const safeDto = { ...dto };
    delete (safeDto as Record<string, unknown>).rating;
    delete (safeDto as Record<string, unknown>).authorId;

    return this.offerModel.findOneAndUpdate({ _id: offerId }, safeDto, {
      new: true,
    });
  }

  public async deleteById(offerId: string): Promise<DeleteResult> {
    const result = await this.offerModel.deleteOne({ _id: offerId }).exec();
    await this.commentModel.deleteMany({ offerId }).exec();
    return result;
  }

  public async findPremiumByCity(cityName: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city: cityName, isPremium: true })
      .sort({ date: SortType.Desc })
      .limit(DEFAULT_PREMIUM_OFFER_COUNT)
      .exec();
  }

  public async findFavorite(userId: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel.find({ favoriteByUsers: userId }).exec();
  }

  public async addToFavorite(offerId: string, userId: string): Promise<void> {
    await this.offerModel
      .updateOne({ _id: offerId }, { $addToSet: { favoriteByUsers: userId } })
      .exec();
    await this.userModel
      .updateOne({ _id: userId }, { $addToSet: { favoriteOffers: offerId } })
      .exec();
  }

  public async deleteFromFavorite(offerId: string, userId: string): Promise<void> {
    await this.offerModel
      .updateOne({ _id: offerId }, { $pull: { favoriteByUsers: userId } })
      .exec();
    await this.userModel
      .updateOne({ _id: userId }, { $pull: { favoriteOffers: offerId } })
      .exec();
  }

  public async incCommentCount(offerId: string): Promise<void> {
    await this.offerModel
      .updateOne({ _id: offerId }, { $inc: { commentsCount: 1 } })
      .exec();
  }

  public async recalculateRating(offerId: string): Promise<void> {
    const avgRatingResult = await this.commentModel
      .aggregate([
        {
          $match: {
            offerId: offerId,
          },
        },
        {
          $group: {
            _id: '$offerId',
            avgRating: { $avg: '$rating' },
          },
        },
      ])
      .exec();
    const avgRating = avgRatingResult.length > 0
      ? Math.round(avgRatingResult[0].avgRating * 10) / 10
      : 0;
    await this.offerModel.findByIdAndUpdate(offerId, { rating: avgRating });
  }

  public async documentExists(documentId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: documentId })) !== null;
  }

  public async findPremium(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({isPremium: true})
      .sort({date: SortType.Desc})
      .limit(DEFAULT_PREMIUM_OFFER_COUNT)
      .exec();
  }
}
