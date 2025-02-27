import { AppFactory } from '@douglasneuroinformatics/libnest/core';
import { PrismaClient } from '@prisma/generated-client';

import { $Config } from './config';

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
  prisma: {
    client: new PrismaClient()
  },
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
