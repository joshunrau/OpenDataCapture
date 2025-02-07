import path from 'node:path';

import { ConfigService } from '@douglasneuroinformatics/libnest/config';
import { ValidationPipe } from '@douglasneuroinformatics/libnest/core';
import { setupDocs } from '@douglasneuroinformatics/libnest/core';
import { JSONLogger } from '@douglasneuroinformatics/libnest/logging';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { AppModule } from './app.module';

export default async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  });
  const configService = app.get(ConfigService);
  const logger = new JSONLogger(null, {
    debug: configService.get('DEBUG'),
    verbose: configService.get('VERBOSE')
  });
  app.useLogger(logger);
  app.enableCors();
  app.enableShutdownHooks();
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI
  });
  app.use(json({ limit: '50MB' }));
  app.useGlobalPipes(new ValidationPipe());

  app.useStaticAssets(path.resolve(import.meta.dirname, '..', 'public'));

  setupDocs(app, {
    config: {
      contact: {
        email: 'support@douglasneuroinformatics.ca',
        name: 'Douglas Neuroinformatics',
        url: 'https://douglasneuroinformatics.ca'
      },
      description: 'Documentation for the REST API for Open Data Capture',
      externalDoc: {
        description: 'Homepage',
        url: 'https://opendatacapture.org'
      },
      license: {
        name: 'Apache-2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0'
      },
      tags: ['Authentication', 'Groups', 'Instruments', 'Instrument Records', 'Subjects', 'Users'],
      title: 'Open Data Capture',
      version: '1'
    },
    path: '/spec.json'
  });

  const isProduction = configService.get('NODE_ENV') === 'production';
  const port = configService.get(isProduction ? 'API_PROD_SERVER_PORT' : 'API_DEV_SERVER_PORT')!;

  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}
