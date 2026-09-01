import type { SerializationViolation } from './errors.js';

function describeObject(value: object) {
  const name: unknown = value.constructor?.name;
  return typeof name === 'string' ? `an instance of '${name}'` : 'an object with a null prototype';
}

function join(path: string, key: number | string) {
  if (typeof key === 'number') {
    return `${path}[${key}]`;
  }
  return path ? `${path}.${key}` : key;
}

function collectNonJsonPrimitive(
  value: ((...args: never) => unknown) | bigint | boolean | number | string | symbol | undefined,
  path: string,
  violations: SerializationViolation[]
) {
  switch (typeof value) {
    case 'bigint':
      violations.push({ path, reason: 'a bigint has no JSON representation' });
      return;
    case 'function':
      violations.push({ path, reason: 'a function has no JSON representation' });
      return;
    case 'number':
      if (!Number.isFinite(value)) {
        violations.push({ path, reason: `${value} is serialized as null by JSON.stringify` });
      }
      return;
    case 'symbol':
      violations.push({ path, reason: 'a symbol has no JSON representation' });
      return;
    default:
      return;
  }
}

/**
 * Record every value under `value` that `JSON.stringify` would drop, throw on, or silently change.
 *
 * The field walk in `serialize.ts` names the constructs an author is expected to hit — a dynamic
 * field, a block, a zod v3 schema. This is the backstop for everything else: a `Date` left in
 * `initialValues`, or a future field kind that carries a function. Without it those are not errors,
 * they are missing keys in the output.
 */
function collectNonJsonValues(
  value: unknown,
  path: string,
  violations: SerializationViolation[],
  ancestors = new Set<object>()
): void {
  if (value === null) {
    return;
  }
  if (typeof value !== 'object') {
    collectNonJsonPrimitive(value as Parameters<typeof collectNonJsonPrimitive>[0], path, violations);
    return;
  }
  // Only an ancestor is a cycle. Instruments routinely share one options object across several
  // fields, and a shared object serializes fine — it is simply written out more than once.
  if (ancestors.has(value)) {
    violations.push({ path, reason: 'a circular reference cannot be serialized' });
    return;
  }
  if (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value)) {
    violations.push({
      path,
      reason: `${describeObject(value)}, which loses its type in JSON — use a plain object, string or number`
    });
    return;
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectNonJsonValues(item, join(path, index), violations, ancestors));
  } else {
    for (const [key, item] of Object.entries(value)) {
      collectNonJsonValues(item, join(path, key), violations, ancestors);
    }
  }
  ancestors.delete(value);
}

export { collectNonJsonValues };
