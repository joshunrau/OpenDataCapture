import { uniq } from '../lodash-es@4.17.21';
import { z } from '../zod@3.23.6';

export const isUnique = (arr: any[]) => uniq(arr).length === arr.length;

export const isObject = (value: unknown): value is object => {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
};

/** Used to determine if object is of type `ZodType` independent of specific instances or library versions */
export function isZodType(arg: unknown): arg is z.ZodTypeAny {
  let prototype: null | object = null;
  if (isObject(arg) && isObject(arg.constructor)) {
    prototype = Reflect.getPrototypeOf(arg.constructor);
  }
  return Boolean(prototype && Reflect.get(prototype, 'name') === 'ZodType');
}
