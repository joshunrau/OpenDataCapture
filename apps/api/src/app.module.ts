import { ConfigModule, ConfigService } from '@douglasneuroinformatics/libnest/config';
import { delay } from '@douglasneuroinformatics/libnest/core';
import { CryptoModule } from '@douglasneuroinformatics/libnest/crypto';
import { LoggingModule } from '@douglasneuroinformatics/libnest/logging';
import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { AuthorizationGuard } from './auth/guards/authorization.guard';
import { $Config } from './core/config';
import { GatewayModule } from './gateway/gateway.module';
import { GroupsModule } from './groups/groups.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { SetupModule } from './setup/setup.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SummaryModule } from './summary/summary.module';
import { UsersModule } from './users/users.module';

import type { Config } from './core/config';

declare module '@douglasneuroinformatics/libnest/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/consistent-type-definitions
  interface UserConfig extends Config {}
}

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      conditionalModules: [
        {
          module: AssignmentsModule,
          when: 'GATEWAY_ENABLED'
        },
        {
          module: GatewayModule,
          when: 'GATEWAY_ENABLED'
        }
      ],
      schema: $Config
    }),
    CryptoModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        pbkdf2Params: {
          iterations: configService.get('DANGEROUSLY_DISABLE_PBKDF2_ITERATION') ? 1 : 100_000
        },
        secretKey: configService.get('SECRET_KEY')
      })
    }),
    GroupsModule,
    InstrumentsModule,
    PrismaModule.forRoot(),
    SubjectsModule,
    LoggingModule.forRoot({
      debug: true
    }),
    UsersModule,
    SetupModule,
    SummaryModule,
    SessionsModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        // this cannot be used with conditional module easily, since APP_GUARD requires something
        return configService.get('THROTTLER_ENABLED')
          ? [
              {
                limit: 25,
                name: 'short',
                ttl: 1000
              },
              {
                limit: 100,
                name: 'medium',
                ttl: 10000
              },
              {
                limit: 250,
                name: 'long',
                ttl: 60000
              }
            ]
          : [];
      }
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard
    }
  ]
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const isDev = this.configService.get('NODE_ENV') === 'development';
    const responseDelay = this.configService.get('API_RESPONSE_DELAY');
    if (isDev && responseDelay) {
      consumer.apply(delay({ responseDelay })).forRoutes('*');
    }
  }
}
