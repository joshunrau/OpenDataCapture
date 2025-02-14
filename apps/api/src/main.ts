import * as path from 'node:path';

import { ConfigService } from '@douglasneuroinformatics/libnest/config';
import { AppFactory } from '@douglasneuroinformatics/libnest/core';
import { CryptoModule } from '@douglasneuroinformatics/libnest/crypto';

import { $Config } from './config';

export default async function main() {
  await AppFactory.createApp({
    callback: async (app, config, logger) => {
      app.useStaticAssets(path.resolve(import.meta.dirname, '..', 'public'));
      const isProduction = config.NODE_ENV === 'production';
      const port = config[isProduction ? 'API_PROD_SERVER_PORT' : 'API_DEV_SERVER_PORT'];
      await app.listen(port);
      const url = await app.getUrl();
      logger.log(`Application is running on: ${url}`);
    },
    docs: {
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
    },
    modules: [
      CryptoModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          pbkdf2Params: {
            iterations: configService.get('DANGEROUSLY_DISABLE_PBKDF2_ITERATION') ? 1 : 100_000
          },
          secretKey: configService.get('SECRET_KEY')
        })
      })
    ],
    schema: $Config,
    version: '1'
  });
}
