import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register cookies
  const configService = app.get(ConfigService);
  const cookieSecret = configService.get('COOKIE_SECRET');
  app.use(cookieParser(cookieSecret));

  // Register session middleware
  app.use(
    session({
      secret: configService.get('SESSION_KEY'),
      resave: false,
      saveUninitialized: true,
    }),
  );

  app.useGlobalPipes(new ValidationPipe());

  // API Docs
  const config = new DocumentBuilder()
    .setTitle('PC API')
    .setDescription('API used by pepijncolenbrander.com')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Emails')
    .addTag('Groups')
    .addTag('Members')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: [/pepijncolenbrander\.com$/, /localhost(:\d+)?$/],
    credentials: true,
  });

  app.use(helmet());

  await app.listen(3000);
}
bootstrap();
