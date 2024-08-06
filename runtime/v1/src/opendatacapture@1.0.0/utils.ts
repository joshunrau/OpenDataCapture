import { uniq } from '../lodash-es@4.17.21';

export const isUnique = (arr: any[]) => uniq(arr).length === arr.length;

export const isObject = (value: unknown): value is object => {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
};
