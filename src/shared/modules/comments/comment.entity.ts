import { defaultClasses, getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { CommentType } from '../../types/index.ts';

@modelOptions({
  schemaOptions: {
    collection: 'comments',
  },
})
export class CommentEntity extends defaultClasses.TimeStamps implements CommentType {
    @prop({
      required: true,
      default: '',
      minlength: 5,
      maxlength: 1024,
      type: () => String,
    })
      text: string;

    @prop({
      required: true,
      type: () => Date,
      default: () => new Date(),
    })
      date: Date;

    @prop({
      required: true,
      min: 1,
      max: 5,
      default: 1,
      type: () => Number,
    })
      rating: number;

    @prop({ required: true, type: () => String })
      authorId: string;

    @prop({ required: true, type: () => String })
      offerId: string;
}

export const CommentModel = getModelForClass(CommentEntity);
