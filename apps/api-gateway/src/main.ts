/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const globalPrefix = 'espapi';
  app.setGlobalPrefix(globalPrefix);

  const configService = app.get(ConfigService);

  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin?.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API Gateway')
      .setDescription('HTTP entrypoint for the microservices')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`📖 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap();
