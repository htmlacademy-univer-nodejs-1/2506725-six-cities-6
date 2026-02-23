import { FileReader } from './file-reader.interface.js';
import { readFileSync } from 'node:fs';
import { Convenience, Offer, OfferType, UserType } from '../../types/index.js';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) { }

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
  }

  public toArray(): Offer[] {
    if (!this.rawData) {
      throw new Error('File was not read');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => line.split('\t'))
      .map(([
        title,
        description,
        postDate,
        city,
        cityLatitude,
        cityLongitude,
        previewPath,
        images,
        isPremium,
        isFavorite,
        rating,
        type,
        roomsCount,
        guestsCount,
        price,
        conveniences,
        authorName,
        authorEmail,
        authorAvatarPath,
        authorPassword,
        authorType,
        commentsCount,
        latitude,
        longitude,
      ]) => ({
        title,
        description,
        postDate: new Date(postDate),
        city: {
          name: city,
          latitude: Number.parseFloat(cityLatitude),
          longitude: Number.parseFloat(cityLongitude)
        },
        previewPath,
        images: images.split(','),
        isPremium: isPremium === 'true',
        isFavorite: isFavorite === 'true',
        rating: Number.parseFloat(rating),
        type: OfferType[type as keyof typeof OfferType],
        roomsCount: Number.parseInt(roomsCount, 10),
        guestsCount: Number.parseInt(guestsCount, 10),
        price: Number.parseInt(price, 10),
        conveniences: conveniences.split(',').map((convenience) => Convenience[convenience as keyof typeof Convenience]),
        author: {
          name: authorName,
          email: authorEmail,
          avatar: authorAvatarPath,
          password: authorPassword,
          type: UserType[authorType as keyof typeof UserType],
        },
        commentsCount: Number.parseInt(commentsCount, 10),
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      }));
  }
}