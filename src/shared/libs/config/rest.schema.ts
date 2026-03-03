import convict from 'convict';
import validators from 'convict-format-with-validator';

convict.addFormats(validators);

export type RestSchema = {
    PORT: number,
    DB_HOST: string,
    SALT: string
};

export const configRestSchema = convict<RestSchema>({
  PORT: {
    doc: 'Порт для входящих подключений',
    format: 'port',
    env: 'PORT',
    default: 4000
  },
  DB_HOST: {
    doc: 'IP-адресс базы данных',
    format: 'ipaddress',
    env: 'DB_HOST',
    default: '127.0.0.1'
  },
  SALT: {
    doc: 'Соль для хэширования',
    format: String,
    env: 'SALT',
    default: null
  }
});
