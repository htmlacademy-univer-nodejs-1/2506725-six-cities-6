import {
  defaultClasses,
  getModelForClass,
  modelOptions,
  prop,
} from '@typegoose/typegoose';
import {
  Offer,
  OfferCityEnum,
  OfferCityType,
  OfferFeatureEnum,
  OfferFeatureType,
  OfferType,
  OfferTypeEmum,
} from '../../types/index.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers',
  },
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class OfferEntity extends defaultClasses.TimeStamps implements Offer {
  @prop({
    required: true,
    default: '',
    minlength: 10,
    maxlength: 100,
    type: () => String,
  })
    name: string;

  @prop({
    required: true,
    default: '',
    minlength: 20,
    maxlength: 1024,
    type: () => String,
  })
    description: string;

  @prop({ required: true, type: () => Date, default: () => new Date() })
    date: Date;

  @prop({ required: true, type: () => String, enum: OfferCityEnum })
    city: OfferCityType;

  @prop({ required: true, default: '', type: () => String })
    preview: string;

  @prop({ required: true, type: () => [String], default: [] })
    images: string[];

  @prop({ required: true, default: false, type: () => Boolean })
    isPremium: boolean;

  @prop({ required: true, default: 0, type: () => Number })
    rating: number;

  @prop({ required: true, default: 0, type: () => Number })
    commentsCount: number;

  @prop({ required: true, type: () => String, enum: OfferTypeEmum })
    type: OfferType;

  @prop({ required: true, default: 1, type: () => Number })
    rooms: number;

  @prop({ required: true, default: 1, type: () => Number })
    guests: number;

  @prop({
    required: true,
    default: 0,
    type: () => Number,
  })
    price: number;

  @prop({ required: true, type: () => [String], enum: OfferFeatureEnum })
    features: OfferFeatureType[];

  @prop({ required: true, type: () => String })
    authorId: string;

  @prop({ required: true, type: () => [Number], default: [0, 0] })
    coordinates: [number, number];
}

export const OfferModel = getModelForClass(OfferEntity);
