import { accessibleBy } from '@casl/prisma';
import type { AppAction } from '@opendatacapture/schemas/core';
import { Prisma } from '@prisma/client';

import type { AppAbility } from '@/core/types';

export function accessibleQuery<T extends Prisma.ModelName>(
  ability: AppAbility | undefined,
  action: AppAction,
  modelName: T
) {
  if (!ability) {
    return {};
  }
  return accessibleBy(ability, action)[modelName];
}
