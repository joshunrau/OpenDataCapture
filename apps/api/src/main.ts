import { AppFactory } from '@douglasneuroinformatics/libnest';
import { APP_GUARD } from '@nestjs/core';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { AuthorizationGuard } from './auth/guards/authorization.guard';
import { $Env } from './core/env.schema';
import { GatewayModule } from './gateway/gateway.module';
import { GroupsModule } from './groups/groups.module';
import { InstrumentRecordsModule } from './instrument-records/instrument-records.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { SessionsModule } from './sessions/sessions.module';
import { SetupModule } from './setup/setup.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SummaryModule } from './summary/summary.module';
import { UsersModule } from './users/users.module';

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
  envSchema: $Env,
  imports: [
    AuthModule,
    GroupsModule,
    InstrumentRecordsModule,
    InstrumentsModule,
    SessionsModule,
    SetupModule,
    SubjectsModule,
    SummaryModule,
    UsersModule,
    {
      module: AssignmentsModule,
      when: 'GATEWAY_ENABLED'
    },
    {
      module: GatewayModule,
      when: 'GATEWAY_ENABLED'
    }
  ],
  prisma: {
    dbPrefix: 'data-capture'
  },
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard
    }
  ],
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
