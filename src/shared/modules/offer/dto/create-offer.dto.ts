import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  OfferCityEnum,
  OfferCityType,
  OfferFeatureEnum,
  OfferFeatureType,
  OfferType,
  OfferTypeEmum,
} from '../../../types/index.js';
import { OfferValidationMessage } from './offer.message.js';

export class CreateOfferDto {
    @IsString({ message: OfferValidationMessage.name.invalidFormat })
    @MinLength(10, { message: OfferValidationMessage.name.minLength })
    @MaxLength(100, { message: OfferValidationMessage.name.maxLength })
  public name: string;

    @IsString({ message: OfferValidationMessage.description.invalidFormat })
    @MinLength(20, { message: OfferValidationMessage.description.minLength })
    @MaxLength(1024, { message: OfferValidationMessage.description.maxLength })
    public description: string;

    @IsDateString({}, { message: OfferValidationMessage.date.invalidFormat })
    public date: string;

    @IsEnum(OfferCityEnum, { message: OfferValidationMessage.city.invalidType })
    public city: OfferCityType;

    @IsBoolean({ message: OfferValidationMessage.isPremium.invalidFormat })
    public isPremium: boolean;

    @IsEnum(OfferTypeEmum, { message: OfferValidationMessage.type.invalidType })
    public type: OfferType;

    @IsInt({ message: OfferValidationMessage.rooms.invalidFormat })
    @Min(1, { message: OfferValidationMessage.rooms.min })
    @Max(8, { message: OfferValidationMessage.rooms.max })
    public rooms: number;

    @IsInt({ message: OfferValidationMessage.guests.invalidFormat })
    @Min(1, { message: OfferValidationMessage.guests.min })
    @Max(10, { message: OfferValidationMessage.guests.max })
    public guests: number;

    @IsInt({ message: OfferValidationMessage.price.invalidFormat })
    @Min(100, { message: OfferValidationMessage.price.min })
    @Max(100000, { message: OfferValidationMessage.price.max })
    public price: number;

    @IsArray({ message: OfferValidationMessage.features.invalidFormat })
    @IsEnum(OfferFeatureEnum, {
      each: true,
      message: OfferValidationMessage.features.invalidId
    })
    public features: OfferFeatureType[];

    public authorId: string;

    @IsArray({ message: OfferValidationMessage.coordinates.invalidFormat })
    @ArrayMinSize(2, { message: OfferValidationMessage.coordinates.arraySize })
    @ArrayMaxSize(2, { message: OfferValidationMessage.coordinates.arraySize })
    public coordinates: number[];
}
