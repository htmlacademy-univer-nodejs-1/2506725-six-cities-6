import { BACKEND_URL } from './api';
import { CITIES, CityLocation, TYPES } from './const';
import type { City, CityName, Comment, Location, NewOffer, Offer, Type, User, UserRegister } from './types/types';
import { parseTokenPayload, Token, UserDirectory } from './utils';

type OfferDto = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  city?: CityName | City;
  preview?: string;
  previewImage?: string;
  images?: string[];
  price?: number;
  isPremium?: boolean;
  isFavorite?: boolean;
  rating?: number;
  type?: string;
  guests?: number;
  maxAdults?: number;
  rooms?: number;
  bedrooms?: number;
  authorId?: string;
  features?: string[];
  goods?: string[];
  coordinates?: number[];
  location?: Location;
  host?: User;
};

type CommentDto = {
  _id?: string;
  id?: string;
  text?: string;
  comment?: string;
  date?: string;
  rating?: number;
  authorId?: string;
  offerId?: string;
  user?: User;
};

type OfferPayload = {
  name: string;
  description: string;
  date: string;
  city: CityName;
  preview: string;
  images: string[];
  isPremium: boolean;
  type: Type;
  rooms: number;
  guests: number;
  price: number;
  features: string[];
  coordinates: number[];
};

const FALLBACK_IMAGE = 'img/room.jpg';
const FALLBACK_AVATAR = 'img/avatar.svg';

const getFallbackName = (authorId: string): string => authorId ? `User ${authorId.slice(-6)}` : 'User';

const getCity = (city?: CityName | City): City => {
  if (typeof city === 'object' && city.name) {
    return city;
  }

  if (typeof city === 'string' && CITIES.includes(city)) {
    return {
      name: city,
      location: CityLocation[city],
    };
  }

  return {
    name: CITIES[0],
    location: CityLocation[CITIES[0]],
  };
};

const getLocation = (coordinates?: number[], location?: Location): Location => {
  if (location) {
    return location;
  }

  if (coordinates && coordinates.length >= 2) {
    return {
      latitude: coordinates[0],
      longitude: coordinates[1],
    };
  }

  return CityLocation[CITIES[0]];
};

const getImageUrl = (image?: string): string => {
  if (!image) {
    return FALLBACK_IMAGE;
  }

  if (image.startsWith('http') || image.startsWith('/') || image.startsWith('img/')) {
    return image;
  }

  if (image.startsWith('default_')) {
    return `${BACKEND_URL}/static/${image}`;
  }

  return `${BACKEND_URL}/upload/${image}`;
};

const getType = (type?: string): Type => {
  const normalizedType = type ? type.toLowerCase() : TYPES[0];

  if (TYPES.includes(normalizedType as Type)) {
    return normalizedType as Type;
  }

  return TYPES[0];
};

const getKnownUser = (authorId: string): User => {
  const savedUser = UserDirectory.get(authorId);

  if (savedUser) {
    return savedUser;
  }

  const currentUser = parseTokenPayload(Token.get());

  if (currentUser?.id === authorId) {
    return {
      id: authorId,
      name: currentUser.name ?? getFallbackName(authorId),
      avatarUrl: FALLBACK_AVATAR,
      isPro: false,
      email: currentUser.email ?? authorId,
    };
  }

  return {
    id: authorId,
    name: getFallbackName(authorId),
    avatarUrl: FALLBACK_AVATAR,
    isPro: false,
    email: authorId,
  };
};

export const adaptOffer = (offer: OfferDto): Offer => {
  const city = getCity(offer.city);
  const location = getLocation(offer.coordinates, offer.location);
  const previewImage = getImageUrl(offer.previewImage ?? offer.preview);
  const authorId = offer.authorId ?? offer.host?.email ?? '';

  return {
    id: offer.id ?? offer._id ?? '',
    price: offer.price ?? 0,
    rating: offer.rating ?? 0,
    title: offer.title ?? offer.name ?? '',
    isPremium: Boolean(offer.isPremium),
    isFavorite: Boolean(offer.isFavorite),
    city,
    location,
    previewImage,
    type: getType(offer.type),
    bedrooms: offer.bedrooms ?? offer.rooms ?? 1,
    description: offer.description ?? '',
    goods: offer.goods ?? offer.features ?? [],
    host: offer.host ?? getKnownUser(authorId),
    images: offer.images && offer.images.length > 0
      ? offer.images.map(getImageUrl)
      : [previewImage],
    maxAdults: offer.maxAdults ?? offer.guests ?? 1,
  };
};

export const adaptOffers = (offers: OfferDto[]): Offer[] => offers.map(adaptOffer);

export const adaptComment = (comment: CommentDto, index = 0): Comment => {
  const authorId = comment.authorId ?? comment.user?.email ?? 'anonymous';

  return {
    id: comment.id ?? comment._id ?? `${comment.offerId ?? 'comment'}-${authorId}-${index}`,
    comment: comment.comment ?? comment.text ?? '',
    date: comment.date ?? new Date().toISOString(),
    rating: comment.rating ?? 0,
    user: comment.user ?? getKnownUser(authorId),
  };
};

export const adaptComments = (comments: CommentDto[]): Comment[] => comments.map(adaptComment);

export const adaptOfferToPayload = (offer: NewOffer | Offer): OfferPayload => ({
  name: offer.title,
  description: offer.description,
  date: new Date().toISOString(),
  city: offer.city.name,
  preview: offer.previewImage || 'default_preview.jpg',
  images: 'images' in offer && offer.images.length > 0 ? offer.images : [offer.previewImage || 'default_photo.jpg'],
  isPremium: offer.isPremium,
  type: offer.type,
  rooms: offer.bedrooms,
  guests: offer.maxAdults,
  price: offer.price,
  features: offer.goods,
  coordinates: [offer.location.latitude, offer.location.longitude],
});

export const adaptRegisterToPayload = ({ email, password, name, isPro, type }: UserRegister) => ({
  email,
  password,
  name,
  type: type ?? (isPro ? 'Pro' : 'Standart'),
});
