import { ConfigService } from '@douglasneuroinformatics/libnest/config';
import { LoggingService } from '@douglasneuroinformatics/libnest/logging';
import { type DynamicModule, Module } from '@nestjs/common';

import { type ExtendedPrismaClient, PRISMA_CLIENT_TOKEN, PrismaFactory } from './prisma.factory';
import { PrismaService } from './prisma.service';
import { getModelReferenceName, getModelToken } from './prisma.utils';

import type { ModelEntityName } from './prisma.types';

@Module({})
export class PrismaModule {
  static forFeature<T extends ModelEntityName>(modelName: T): DynamicModule {
    const modelToken = getModelToken(modelName);
    return {
      exports: [modelToken],
      module: PrismaModule,
      providers: [
        {
          inject: [PRISMA_CLIENT_TOKEN, LoggingService],
          provide: modelToken,
          useFactory: (client: ExtendedPrismaClient, loggingService: LoggingService) => {
            loggingService.log(`Injecting model for resolved token: '${modelToken}'`);
            return client[getModelReferenceName(modelName)];
          }
        }
      ]
    };
  }
  static forRoot(): DynamicModule {
    return {
      exports: [PRISMA_CLIENT_TOKEN, PrismaService],
      global: true,
      module: PrismaModule,
      providers: [
        {
          inject: [ConfigService, LoggingService],
          provide: PRISMA_CLIENT_TOKEN,
          useFactory: (configService: ConfigService, loggingService: LoggingService) => {
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
                url.searchParams.append(key, value);
              }
            }
            loggingService.log(`Attempting to create client with data source: '${url.href}'`);
            return PrismaFactory.createClient({ datasourceUrl: url.href });
          }
        },
        PrismaService
      ]
    };
  }
}
