import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import type { CamelCase, Simplify } from 'type-fest';

type CamelCased<T extends { [key: string]: any }> = Simplify<{
  [K in keyof T as CamelCase<K>]: T[K];
}>;

export function formatSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}

export function mapKeysToCamelCase<T extends { [key: string]: any }>(obj: T) {
  const result: { [key: string]: any } = {};
  for (const key in obj) {
    result[snakeToCamelCase(key)] = obj[key];
  }
  return result as CamelCased<T>;
}
