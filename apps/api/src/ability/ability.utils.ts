import { accessibleBy } from '@casl/prisma';
import type { AppAction } from '@opendatacapture/schemas/core';
import { Prisma } from '@prisma/client';

import type { AppAbility } from '@/core/types';

export type ModelEntityName<T extends Prisma.ModelName> = T extends `${infer U}Model` ? U : never;

export function accessibleQuery<T extends Prisma.ModelName>(
  ability: AppAbility | undefined,
  action: AppAction,
  modelName: ModelEntityName<T>
) {
  if (!ability) {
    return {};
  }
  // @ts-expect-error - we use a custom subject name
  return accessibleBy(ability, action)[modelName] as ReturnType<typeof accessibleBy>[T];
}

export function getEntityName<T extends Prisma.ModelName>(modelName: T) {
  return modelName.replace(/Model$/, '') as ModelEntityName<T>;
}
