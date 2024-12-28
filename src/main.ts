import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@app/common';
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.get(HttpAdapterHost);

  app.use(cookieParser());

  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
