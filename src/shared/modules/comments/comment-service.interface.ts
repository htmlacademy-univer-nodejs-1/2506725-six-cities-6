import { DocumentType } from '@typegoose/typegoose';
import { CreateCommentDto } from './dto/create-comment.dto.ts';
import { CommentEntity } from './comment.entity.ts';

export type CreateCommentData = CreateCommentDto & {
    offerId: string;
};

export interface CommentService {
    create(dto: CreateCommentData): Promise<DocumentType<CommentEntity>>;
    find(offerId: string): Promise<DocumentType<CommentEntity>[]>;
}
