import { detectSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import type { AppSubject } from '@prisma/client';

import type { AppAbilities, AppAbility, Permission } from './auth.types';

export function detectAppSubject(obj: { [key: string]: any }) {
  if (typeof obj.__modelName === 'string') {
    return obj.__modelName as AppSubject;
  }
  return detectSubjectType(obj) as AppSubject;
}

export function createAppAbility(permissions: Permission[]): AppAbility {
  return createPrismaAbility<AppAbilities>(permissions, {
    detectSubjectType: detectAppSubject
  });
}
