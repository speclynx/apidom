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

export default setProperty;
