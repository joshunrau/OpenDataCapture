/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

declare global {
  const __RELEASE__: ReleaseInfo;
  namespace Express {
    interface User extends TokenPayload {
      ability: AppAbility;
    }
  }
}
