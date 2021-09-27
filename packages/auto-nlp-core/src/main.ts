import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as appRoot from 'app-root-path';

const logger = new Logger('main');

appRoot.setPath(__dirname);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TagFlip Auto-NLP')
    .setDescription('The TagFlip Auto-NLP description')
    .setVersion('1.0')
    .addTag('TagFlip Auto-NLP')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  const port = config.get('AUTONLP_CORE_PORT', 3000);

  logger.log('Listening on port ' + port + '...');
  await app.listen(port);
}

bootstrap();
