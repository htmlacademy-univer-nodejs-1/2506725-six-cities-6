import { DocumentType } from '@typegoose/typegoose';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { OfferEntity } from './offer.entity.js';
import { DeleteResult } from 'mongoose';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DocumentExists } from '../../types/document-exists.interface.js';

export interface OfferService extends DocumentExists {
    create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
    updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null>;
    deleteById(offerId: string): Promise<DeleteResult>;
    find(limit?: number): Promise<DocumentType<OfferEntity>[]>;
    findPremium(): Promise<DocumentType<OfferEntity>[]>;
    findByOfferId(offerId: string): Promise<DocumentType<OfferEntity> | null>;
    findByOfferName(offerName: string): Promise<DocumentType<OfferEntity> | null>;
    findByOfferNameOrCreate(
        offerName: string,
        dto: CreateOfferDto
    ): Promise<DocumentType<OfferEntity>>;
    findPremiumByCity(cityName: string): Promise<DocumentType<OfferEntity>[]>;
    findFavorite(userId: string): Promise<DocumentType<OfferEntity>[]>;
    addToFavorite(offerId: string, userId: string): Promise<void>;
    deleteFromFavorite(offerId: string, userId: string): Promise<void>;
    incCommentCount(offerId: string): Promise<void>;
    recalculateRating(offerId: string): Promise<void>;
}
