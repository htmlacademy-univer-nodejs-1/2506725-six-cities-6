import 'reflect-metadata';
import { Container } from 'inversify';
import { RestApplication } from './rest/index.ts';
import { RestConfig } from './shared/libs/config/rest.config.ts';
import { Logger, PinoLogger } from './shared/libs/logger/index.ts';
import { Component } from './shared/types/component.enum.ts';
import { Config, RestSchema } from './shared/libs/config/index.ts';

async function bootstrap() {
  const container = new Container();
  container.bind<RestApplication>(Component.RestApplication).to(RestApplication).inSingletonScope();
  container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<Config<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();

  const application = container.get<RestApplication>(Component.RestApplication);
  await application.init();
}

bootstrap();
