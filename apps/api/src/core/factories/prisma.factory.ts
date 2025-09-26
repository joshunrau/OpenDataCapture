import { ConfigService, LibnestPrismaExtension } from '@douglasneuroinformatics/libnest';
import type { PrismaModelKey, PrismaModelName } from '@douglasneuroinformatics/libnest';
import { PrismaClient } from '@prisma/client';

export class PrismaFactory {
  constructor(private readonly configService: ConfigService) {}

  createClient() {
    return new PrismaClient({ datasourceUrl: this.getDatasourceUrl() }).$extends(LibnestPrismaExtension);
  }

  private getDatasourceUrl() {
    const mongoUri = this.configService.get('MONGO_URI');
    const env = this.configService.get('NODE_ENV');
    const url = new URL(`${mongoUri.href}/data-capture-${env}`);
    const params = {
      directConnection: this.configService.get('MONGO_DIRECT_CONNECTION'),
      replicaSet: this.configService.get('MONGO_REPLICA_SET'),
      retryWrites: this.configService.get('MONGO_RETRY_WRITES'),
      w: this.configService.get('MONGO_WRITE_CONCERN')
    };
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.append(key, String(value));
      }
    }
    return url.href;
  }
}

export type RuntimePrismaClient = ReturnType<PrismaFactory['createClient']>;

export type PrismaModelWhereInputMap = {
  [K in PrismaModelName]: RuntimePrismaClient[PrismaModelKey<K>] extends {
    findFirst: (args: { where: infer TWhereInput }) => any;
  }
    ? TWhereInput
    : never;
};
