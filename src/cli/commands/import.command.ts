import chalk from 'chalk';
import { TsvFileReader } from '../../shared/libs/file-reader/index.js';
import { Command } from './command.interface.js';
import { createOffer, getErrorMessage, getMongoURI } from '../../shared/helpers/index.js';
import { UserService } from '../../shared/modules/user/user-service.interface.js';
import { DatabaseClient } from '../../shared/libs/database-client/database-client.interface.js';
import { Logger } from '../../shared/libs/logger/logger.interface.js';
import { DefaultUserService } from '../../shared/modules/user/default-user.service.js';
import { MongoDatabaseClient } from '../../shared/libs/database-client/mongo.database-client.js';
import { OfferService } from '../../shared/modules/offer/offer-service.interface.js';
import { ConsoleLogger } from '../../shared/libs/logger/console.logger.js';
import { DefaultOfferService } from '../../shared/modules/offer/default-offer.service.js';
import { OfferModel } from '../../shared/modules/offer/offer.entity.js';
import { UserModel } from '../../shared/modules/user/user.entity.js';
import { CommentModel } from '../../shared/modules/comments/comment.entity.js';
import { ParsedLine, UserType, UserTypeEnum } from '../../shared/types/index.js';

const isUserType = (type: string): type is UserType =>
  type === UserTypeEnum.Standart || type === UserTypeEnum.Pro;

export class ImportCommand implements Command {
  private userService: UserService;
  private offerService: OfferService;
  private databaseClient: DatabaseClient;
  private logger: Logger;
  private salt: string;

  constructor() {
    this.logger = new ConsoleLogger();
    this.offerService = new DefaultOfferService(this.logger, OfferModel, CommentModel, UserModel);
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.databaseClient = new MongoDatabaseClient(this.logger);
    this.salt = process.env.SALT ?? 'default-salt';
  }

  public getName(): string {
    return '--import';
  }

  private async saveOffer({ offer, user }: ParsedLine) {
    if (!isUserType(user.type)) {
      return;
    }

    const existingUser = await this.userService.findByEmail(user.email);
    const dbUser =
            existingUser ??
            (await this.userService.create(
              {
                name: user.name,
                email: user.email,
                password: user.password,
                type: user.type,
              },
              this.salt
            ));

    await this.offerService.create({
      name: offer.name,
      description: offer.description,
      date: offer.date.toISOString(),
      city: offer.city,
      isPremium: offer.isPremium,
      type: offer.type,
      rooms: offer.rooms,
      guests: offer.guests,
      price: offer.price,
      features: offer.features,
      authorId: dbUser.id,
      coordinates: offer.coordinates,
    });
  }

  private async onImportedLine(line: string): Promise<void> {
    try {
      const parsed = createOffer(line);
      await this.saveOffer(parsed);
    } catch (error) {
      console.error(`Ошибка на строке: ${line}`, error);
    }
  }

  public async onImportEnd(totalLines: number): Promise<void> {
    console.info(
      chalk.green(
        `Import completed successfully! Total lines: ${chalk.yellow(totalLines)}`
      )
    );
    await this.databaseClient.disconnect();
  }

  private getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`Environment variable ${name} is required`);
    }

    return value;
  }

  public async execute(filePath: string): Promise<void> {
    const uri = getMongoURI(
      this.getRequiredEnv('DB_USER'),
      this.getRequiredEnv('DB_PASSWORD'),
      this.getRequiredEnv('DB_HOST'),
      this.getRequiredEnv('DB_PORT'),
      this.getRequiredEnv('DB_NAME')
    );

    await this.databaseClient.connect(uri);
    const fileReader = new TsvFileReader(filePath.trim());

    fileReader.on('line', async (line, resolve) => {
      await this.onImportedLine(line);
      resolve();
    });
    fileReader.on('end', (totalLines) => this.onImportEnd(totalLines));

    try {
      await fileReader.read();
    } catch (error) {
      console.error(chalk.red(`Error reading file: ${getErrorMessage(error)}`));
    }
  }
}
