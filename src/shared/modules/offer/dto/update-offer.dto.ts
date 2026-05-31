import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { OfferCityEnum, OfferCityType, OfferFeatureEnum, OfferFeatureType, OfferType, OfferTypeEmum } from '../../../types/index.ts';
import { OfferValidationMessage } from './offer.message.ts';

export class UpdateOfferDto {
    @IsOptional()
    @IsString({ message: OfferValidationMessage.name.invalidFormat })
    @MinLength(10, { message: OfferValidationMessage.name.minLength })
    @MaxLength(100, { message: OfferValidationMessage.name.maxLength })
  public name?: string;

    @IsOptional()
    @IsString({ message: OfferValidationMessage.description.invalidFormat })
    @MinLength(20, { message: OfferValidationMessage.description.minLength })
    @MaxLength(1024, { message: OfferValidationMessage.description.maxLength })
    public description?: string;

    @IsOptional()
    @IsDateString({}, { message: OfferValidationMessage.date.invalidFormat })
    public date?: string;

    @IsOptional()
    @IsEnum(OfferCityEnum, { message: OfferValidationMessage.city.invalidType })
    public city?: OfferCityType;

    @IsOptional()
    @IsString({ message: OfferValidationMessage.preview.invalidFormat })
    public preview?: string;

    @IsOptional()
    @IsArray({ message: OfferValidationMessage.images.invalidFormat })
    @IsString({ each: true })
    public images?: string[];

    @IsOptional()
    @IsBoolean({ message: OfferValidationMessage.isPremium.invalidFormat })
    public isPremium?: boolean;

    @IsOptional()
    @IsEnum(OfferTypeEmum, { message: OfferValidationMessage.type.invalidType })
    public type?: OfferType;

    @IsOptional()
    @IsInt({ message: OfferValidationMessage.rooms.invalidFormat })
    @Min(1, { message: OfferValidationMessage.rooms.min })
    @Max(8, { message: OfferValidationMessage.rooms.max })
    public rooms?: number;

    @IsOptional()
    @IsInt({ message: OfferValidationMessage.guests.invalidFormat })
    @Min(1, { message: OfferValidationMessage.guests.min })
    @Max(10, { message: OfferValidationMessage.guests.max })
    public guests?: number;

    @IsOptional()
    @IsInt({ message: OfferValidationMessage.price.invalidFormat })
    @Min(100, { message: OfferValidationMessage.price.min })
    @Max(100000, { message: OfferValidationMessage.price.max })
    public price?: number;

    @IsOptional()
    @IsArray({ message: OfferValidationMessage.features.invalidFormat })
    @IsEnum(OfferFeatureEnum, {
      each: true,
      message: OfferValidationMessage.features.invalidId
    })
    public features?: OfferFeatureType[];

    @IsOptional()
    @IsMongoId({ message: OfferValidationMessage.authorId.invalidId })
    public authorId?: string;

    @IsOptional()
    @IsArray({ message: OfferValidationMessage.coordinates.invalidFormat })
    @ArrayMinSize(2, { message: OfferValidationMessage.coordinates.arraySize })
    @ArrayMaxSize(2, { message: OfferValidationMessage.coordinates.arraySize })
    public coordinates?: number[];
}
