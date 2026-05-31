import { inject } from 'inversify';
import { CommentService, CreateCommentData } from './comment-service.interface.ts';
import { Component } from '../../types/component.enum.ts';
import { Logger } from '../../libs/logger/logger.interface.ts';
import { DocumentType, types } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.ts';
import { SortType } from '../../types/sort-type.enum.ts';

const COMMENT_LIMIT = 50;

export class DefaultCommentService implements CommentService {
  constructor(
        @inject(Component.Logger) private readonly logger: Logger,
        @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>
  ) { }

  create(dto: CreateCommentData): Promise<DocumentType<CommentEntity>> {
    const result = this.commentModel.create(dto);
    this.logger.info(`Создан новый комментарий: ${dto.text}`);
    return result;
  }

  async find(offerId: string): Promise<DocumentType<CommentEntity>[]> {
    this.logger.info(`Поиск комментариев к предложению ${offerId}`);
    const comments = await this.commentModel
      .find({ offerId })
      .sort({ date: SortType.Desc })
      .limit(COMMENT_LIMIT)
      .exec();

    this.logger.info(`Найдены комментарии: ${comments.join()}`);
    return comments;
  }
}
