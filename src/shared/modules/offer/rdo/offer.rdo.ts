import { Expose } from 'class-transformer';
import { OfferCityType, OfferFeatureType } from '../../../types/index.ts';

export class OfferRdo {
    @Expose()
  public id: string;

    @Expose()
    public name: string;

    @Expose()
    public description: string;

    @Expose()
    public date: Date;

    @Expose()
    public city: OfferCityType;

    @Expose()
    public preview: string;

    @Expose()
    public images: string[];

    @Expose()
    public price: number;

    @Expose()
    public isPremium: boolean;

    @Expose()
    public isFavorite: boolean;

    @Expose()
    public rating: number;

    @Expose()
    public type: string;

    @Expose()
    public guests: number;

    @Expose()
    public rooms: number;

    @Expose()
    public commentsCount: number;

    @Expose()
    public authorId: string;

    @Expose()
    public features: OfferFeatureType[];

    @Expose()
    public coordinates: number[];
}
