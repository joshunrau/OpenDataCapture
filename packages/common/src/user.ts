import type { UserModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $BaseModel } from './core';
import { $Group } from './group';

import type { Group } from './group';

export const $StrongPassword = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{12,}$/, {
  message:
    'Password must be string of 12 or more characters, with a minimum of one upper case letter, lowercase letter, and number'
});

export const $BasePermissionLevel = z.enum(['ADMIN', 'GROUP_MANAGER', 'STANDARD']);

export type BasePermissionLevel = z.infer<typeof $BasePermissionLevel>;

export type User = UserModel & { groups: Group[] };
export const $User = $BaseModel.extend({
  basePermissionLevel: $BasePermissionLevel.nullable(),
  firstName: z.string().min(1),
  groupIds: z.array(z.string()),
  groups: z.array($Group),
  lastName: z.string().min(1),
  password: z.string().min(1),
  username: z.string().min(1)
}) satisfies z.ZodType<User>;

export type CreateUserData = z.infer<typeof $CreateUserData>;
export const $CreateUserData = $User
  .pick({
    basePermissionLevel: true,
    firstName: true,
    groupIds: true,
    lastName: true,
    password: true,
    username: true
  })
  .extend({
    password: $StrongPassword
  });

export type UpdateUserData = z.infer<typeof $UpdateUserData>;
export const $UpdateUserData = $CreateUserData.partial();