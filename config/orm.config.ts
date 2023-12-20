import { ConfigService } from '@nestjs/config';

export default function (configService: ConfigService) {
  let config: Object = {};

  switch (process.env.NODE_ENV) {
    case 'development':
      config = {
        type: configService.get<string>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [configService.get<string>('DB_ENTITIES')],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      };
      break;
    case 'test':
      config = {
        type: configService.get<string>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [configService.get<string>('DB_ENTITIES')],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      };
      break;
    case 'production':
      break;
  }
  return config;
}
