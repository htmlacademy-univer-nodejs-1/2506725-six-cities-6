import { inject, injectable } from 'inversify';
import {
  BaseController,
  HttpError,
  HttpMethod,
  PrivateRouteMiddleware,
  UploadFileMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectMiddleware,
} from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Request, Response } from 'express';
import { UserService } from './user-service.interface.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { StatusCodes } from 'http-status-codes';
import { fillDTO } from '../../helpers/index.js';
import { UserRdo } from './rdo/user.rdo.js';
import { LoginUserRequest } from './requests/login-user-request.type.ts';
import { LogoutUserRequest } from './requests/logout-user-request.type.ts';
import { RefreshUserRequest } from './requests/refresh-user-request.type.ts';
import { CreateUserRequest } from './requests/create-user-request.type.js';
import { CreateUserDto, LoginUserDto } from './index.ts';
import { AuthService } from '../auth/auth-service.interface.ts';
import { LoggedUserRdo } from './rdo/logged-user.rdo.ts';
import { UploadUserAvatarRdo } from './rdo/upload-user-avatar.rdo.ts';

@injectable()
export class UserController extends BaseController {
  constructor(
        @inject(Component.Logger) readonly logger: Logger,
        @inject(Component.UserService) private readonly userService: UserService,
        @inject(Component.Config) private readonly config: Config<RestSchema>,
        @inject(Component.AuthService) private readonly authService: AuthService
  ) {
    super(logger);
    this.logger.info('Register routes for UserController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)],
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuthenticate,
      middlewares: [new PrivateRouteMiddleware()],
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)],
    });

    this.addRoute({
      path: '/logout',
      method: HttpMethod.Post,
      handler: this.logout,
      middlewares: [new PrivateRouteMiddleware()],
    });

    this.addRoute({
      path: '/refresh',
      method: HttpMethod.Post,
      handler: this.refresh,
      middlewares: [new PrivateRouteMiddleware()],
    });

    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectMiddleware('userId'),
        new UploadFileMiddleware(this.config.get('UPLOAD_DIRECTORY'), 'avatar'),
      ],
    });
  }

  public async create(
    { body }: CreateUserRequest,
    res: Response
  ): Promise<void> {
    const existUser = await this.userService.findByEmail(body.email);

    if (existUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `Пользователь с почтой «${body.email}» уже существует.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.config.get('SALT'));
    this.created(res, fillDTO(UserRdo, result));
  }

  public async login({ body }: LoginUserRequest, res: Response): Promise<void> {
    const user = await this.authService.verify(body);
    const token = await this.authService.authenticate(user);

    const responseData = fillDTO(LoggedUserRdo, user);
    this.ok(res, Object.assign(responseData, { token }));
  }

  public async logout(
    _req: LogoutUserRequest,
    res: Response
  ): Promise<void> {
    this.noContent(res);
  }

  public async refresh(
    { body }: RefreshUserRequest,
    res: Response
  ): Promise<void> {
    this.ok(res, body.token);
  }

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    if (typeof userId !== 'string') {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'incorrect user id');
    }
    const uploadFile = { avatar: req.file?.filename };

    await this.userService.updateById(userId, uploadFile);
    this.created(
      res,
      fillDTO(UploadUserAvatarRdo, { avatar: uploadFile.avatar })
    );
  }

  public async checkAuthenticate(
    { tokenPayload: { email } }: Request,
    res: Response
  ) {
    const foundedUser = await this.userService.findByEmail(email);

    if (!foundedUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Неавторизован',
        'UserController'
      );
    }

    this.ok(res, fillDTO(LoggedUserRdo, foundedUser));
  }
}
