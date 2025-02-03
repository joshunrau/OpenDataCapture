import { InternalServerErrorException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/generated-client';

export const PRISMA_CLIENT_TOKEN = 'PRISMA_CLIENT';

export class PrismaFactory {
  static createClient(options: Prisma.PrismaClientOptions) {
    const baseClient = new PrismaClient(options);
    const extendedClient = baseClient.$extends({
      model: {
        $allModels: {
          async exists<T extends object>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
            let result: boolean;
            try {
              const context = Prisma.getExtensionContext(this) as unknown as {
                findFirst: (...args: any[]) => Promise<unknown>;
              };
              result = (await context.findFirst({ where })) !== null;
            } catch (err) {
              throw new InternalServerErrorException('Prisma Error', { cause: err });
            }
            return result;
          }
        }
      },
      result: {
        assignmentModel: {
          __model__: {
            compute() {
              return 'Assignment';
            }
          }
        },
        groupModel: {
          __model__: {
            compute() {
              return 'Group';
            }
          }
        },
        instrumentModel: {
          __model__: {
            compute() {
              return 'Instrument';
            }
          }
        },
        instrumentRecordModel: {
          __model__: {
            compute() {
              return 'InstrumentRecord';
            }
          }
        },
        sessionModel: {
          __model__: {
            compute() {
              return 'Session';
            }
          }
        },
        subjectModel: {
          __model__: {
            compute() {
              return 'Subject';
            }
          }
        },
        userModel: {
          __model__: {
            compute() {
              return 'User';
            }
          }
        }
      }
    });
    return extendedClient;
  }
}

export type ExtendedPrismaClient = ReturnType<typeof PrismaFactory.createClient>;
