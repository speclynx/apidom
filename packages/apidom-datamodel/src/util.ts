/**
 * Defines a key on a plain object or class instance built from untrusted input.
 *
 * A "__proto__" key must be defined rather than assigned: assignment invokes the
 * prototype setter, which drops the member from the result and replaces the
 * target's prototype with the incoming value. Every other key takes the plain
 * assignment fast path.
 */
const setProperty = (target: object, key: string, value: unknown): void => {
  if (key === '__proto__') {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  } else {
    (target as Record<string, unknown>)[key] = value;
  }
};

export default setProperty;
