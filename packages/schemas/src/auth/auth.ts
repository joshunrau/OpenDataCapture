import { z } from '@opendatacapture/runtime-v1/zod@3.23.6/index.js';

import type { Permissions } from '../core/core.js';
import type { Group } from '../group/group.js';

export type AuthPayload = {
  accessToken: string;
};

export type LoginCredentials = z.infer<typeof $LoginCredentials>;
export const $LoginCredentials = z.object({
  password: z.string(),
  username: z.string()
});

export type JwtPayload = {
  firstName: null | string;
  groups: Group[];
  lastName: null | string;
  permissions: Permissions;
  username: string;
};
