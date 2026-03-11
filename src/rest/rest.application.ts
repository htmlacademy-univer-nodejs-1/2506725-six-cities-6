import { inject, injectable } from 'inversify';
import { Config } from '../shared/libs/config/config.interface.ts';
import { RestSchema } from '../shared/libs/config/rest.schema.ts';
import { Logger } from '../shared/libs/logger/index.ts';
import { Component } from '../shared/types/component.enum.ts';

@injectable()
export class RestApplication {
  constructor(
        @inject(Component.Logger) private readonly logger: Logger,
        @inject(Component.Config) private readonly config: Config<RestSchema>
  ) {}

  public async init() {
    this.logger.info('REST запущен!');
    this.logger.info(`Из файла .env получено значение $PORT: ${this.config.get('PORT')}`);
  }
}
