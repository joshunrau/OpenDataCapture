import { AppFactory, ConfigService } from '@douglasneuroinformatics/libnest/core';
// import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from '@douglasneuroinformatics/libnest/prisma';

import { $Config } from './config';
import { PrismaFactory } from './prisma/prisma.factory';

export default AppFactory.create({
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
      title: 'Open Data Capture'
    },
    path: '/spec.json'
  },
  imports: [
    PrismaModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const mongoUri = configService.get('MONGO_URI');
        const dbName = configService.get('NODE_ENV');
        const url = new URL(`${mongoUri.href}/data-capture-${dbName}`);
        const params = {
          directConnection: configService.get('MONGO_DIRECT_CONNECTION'),
          replicaSet: configService.get('MONGO_REPLICA_SET'),
          retryWrites: configService.get('MONGO_RETRY_WRITES'),
          w: configService.get('MONGO_WRITE_CONCERN')
        };
        for (const [key, value] of Object.entries(params)) {
          if (value) {
            url.searchParams.append(key, String(value));
          }
        }
        return PrismaFactory.createClient({ datasourceUrl: url.href });
      }
    })
  ],
  schema: $Config,
  version: '1'
});

// export default async function main() {
//   await AppFactory.createApp({
//     callback: async (app, config, logger) => {
//       app.useStaticAssets(path.resolve(import.meta.dirname, '..', 'public'));
//       const isProduction = config.NODE_ENV === 'production';
//       const port = config[isProduction ? 'API_PROD_SERVER_PORT' : 'API_DEV_SERVER_PORT'];
//       await app.listen(port);
//       const url = await app.getUrl();
//       logger.log(`Application is running on: ${url}`);
//     },
//     docs: {
//       config: {
//         contact: {
//           email: 'support@douglasneuroinformatics.ca',
//           name: 'Douglas Neuroinformatics',
//           url: 'https://douglasneuroinformatics.ca'
//         },
//         description: 'Documentation for the REST API for Open Data Capture',
//         externalDoc: {
//           description: 'Homepage',
//           url: 'https://opendatacapture.org'
//         },
//         license: {
//           name: 'Apache-2.0',
//           url: 'https://www.apache.org/licenses/LICENSE-2.0'
//         },
//         tags: ['Authentication', 'Groups', 'Instruments', 'Instrument Records', 'Subjects', 'Users'],
//         title: 'Open Data Capture',
//         version: '1'
//       },
//       path: '/spec.json'
//     },
//     // providers: [
//     //   {
//     //     provide: APP_GUARD,
//     //     useClass: AuthenticationGuard
//     //   },
//     //   {
//     //     provide: APP_GUARD,
//     //     useClass: AuthorizationGuard
//     //   }
//     // ],
//     schema: $Config,
//     version: '1'
//   });
// }
