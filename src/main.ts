import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as csurf from 'csurf';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);
  app.use(helmet());
  app.use(compression());
  app.use(csurf());
  await app.listen(+configService.get('PORT'));
}
bootstrap();
