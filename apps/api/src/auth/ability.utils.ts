import { detectSubjectType } from '@casl/ability';
import type { AppSubject } from '@prisma/client';

export function detectAppSubject(obj: { [key: string]: any }) {
  if (typeof obj.__modelName === 'string') {
    return obj.__modelName as AppSubject;
  }
  return detectSubjectType(obj) as AppSubject;
}
