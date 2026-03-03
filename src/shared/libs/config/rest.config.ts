import { config } from 'dotenv';
import { Logger } from '../logger/index.ts';
import { Config } from './config.interface.ts';
import { configRestSchema, RestSchema } from './rest.schema.ts';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.ts';

@injectable()
export class RestConfig implements Config<RestSchema> {
  private readonly config: RestSchema;

  constructor(
        @inject(Component.Logger) private readonly logger: Logger
  ) {
    const parsedEnv = config();

    if (parsedEnv.error) {
      throw new Error('Can\'t read .env file. Perhaps the file does not exists.');
    }

    configRestSchema.load({});
    configRestSchema.validate({ allowed: 'strict', output: this.logger.info });

    this.config = configRestSchema.getProperties();
    this.logger.info('.env file found and successfully parsed!');
  }


  public get<T extends keyof RestSchema>(key: T): RestSchema[T] {
    return this.config[key];
  }
}
