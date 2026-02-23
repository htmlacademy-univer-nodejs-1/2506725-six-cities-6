import {User} from './user.type.js';

export type City = {
    name: string;
    latitude: number;
    longitude: number;
}

export enum Convenience {
    Breakfast = 'Breakfast',
    AirConditioning = 'Air conditioning',
    LaptopFriendlyWorkspace = 'Laptop friendly workspace',
    BabySeat = 'Baby seat',
    Washer = 'Washer',
    Towels = 'Towels',
    Fridge = 'Fridge',
};

export enum OfferType {
    Apartment = 'Apartment',
    House = 'House',
    Room = 'Room',
    Hotel = 'Hotel',
};

export type Offer = {
    title: string;
    description: string;
    postDate: Date;
    city: City;
    previewPath: string;
    images: string[];
    isPremium: boolean;
    isFavorite: boolean;
    rating: number;
    type: OfferType;
    roomsCount: number;
    guestsCount: number;
    price: number;
    conveniences: Convenience[];
    author: User;
    commentsCount: number;
    latitude: number;
    longitude: number;
}