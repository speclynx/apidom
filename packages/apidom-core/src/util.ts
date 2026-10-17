/**
 * Defines a key on a plain object being built from an ApiDOM element tree.
 *
 * A "__proto__" key must be defined rather than assigned: assignment invokes
 * the prototype setter, which drops the member from the result and hands
 * document content to consumers as the object's prototype. Every other key
 * takes the plain assignment fast path.
 */
const setProperty = (target: Record<string, unknown>, key: string, value: unknown): void => {
  if (key === '__proto__') {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  } else {
    target[key] = value;
  }
};

/**
 * Returns the property name for an object member's key, serialized to a JavaScript value.
 *
 * A scalar key that isn't a string (e.g. YAML `200:`) is named by its string form, like a
 * JavaScript property name, and a collection key (e.g. YAML `[x]: 1`) by its JSON text. A cyclic
 * collection key has no JSON text, and a missing key no name; their members are skipped.
 */
export const toPropertyName = (key: unknown): string | undefined => {
  if (typeof key === 'string') return key;
  if (typeof key === 'number' || typeof key === 'boolean' || key === null) return String(key);
  if (typeof key !== 'object') return undefined;
  try {
    return JSON.stringify(key);
  } catch {
    return undefined;
  }
};

export default setProperty;
