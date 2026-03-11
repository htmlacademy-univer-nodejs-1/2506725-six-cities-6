import { Logger as PinoInstance, pino, transport } from 'pino';
import { Logger } from './logger.interface.ts';
import { getCurrentModuleDirectoryPath } from '../../helpers/index.ts';
import { resolve } from 'node:path';
import { injectable } from 'inversify';

@injectable()
export class PinoLogger implements Logger {
  private readonly logger: PinoInstance;

  constructor() {
    const modulePath = getCurrentModuleDirectoryPath();
    const logFilePath = 'logs/rest.log';
    const destination = resolve(modulePath, '../../../', logFilePath);

    const multiTransport = transport({
      targets: [
        {
          target: 'pino/file',
          options: { destination },
          level: 'debug'
        },
        {
          target: 'pino/file',
          level: 'info',
          options: {},
        }
      ],
    });

    this.logger = pino({}, multiTransport);
    this.logger.info('Логер создан!');
  }

  public info(message: string, ...args: unknown[]): void {
    this.logger.info({ args }, message);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.logger.warn({ args }, message);
  }

  public error(message: string, error: Error, ...args: unknown[]): void {
    this.logger.error({ error, args }, message);
  }

  public debug(message: string, ...args: unknown[]): void {
    this.logger.debug({ args }, message);
  }
}
