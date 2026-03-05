import { clone } from 'ramda';

import type Element from './primitives/Element.ts';

/**
 * Lightweight meta container for Element metadata.
 *
 * Data is stored as own properties on the instance; methods live on the prototype.
 * `Object.keys()`, `Object.entries()`, etc. only see data properties.
 *
 * @public
 */
class Metadata {
  // Set via prototype assignment in registration.ts to avoid circular dependency
  declare Element: typeof Element;
  declare cloneDeepElement: (element: Element) => Element;

  get(name: string): unknown {
    return (this as Record<string, unknown>)[name];
  }

  set(name: string, value: unknown): void {
    (this as Record<string, unknown>)[name] = value;
  }

  hasKey(name: string): boolean {
    return Object.hasOwn(this, name);
  }

  keys(): string[] {
    return Object.keys(this);
  }

  remove(name: string): void {
    delete (this as Record<string, unknown>)[name];
  }

  get isEmpty(): boolean {
    return Object.keys(this).length === 0;
  }

  get isFrozen(): boolean {
    return Object.isFrozen(this);
  }

  freeze(): void {
    for (const value of Object.values(this)) {
      if (value instanceof this.Element) {
        value.freeze();
      } else if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
        Object.freeze(value);
      }
    }
    Object.freeze(this);
  }

  /**
   * Creates a shallow clone. Same references, new container.
   */
  cloneShallow(): Metadata {
    const clone = new Metadata();
    Object.assign(clone, this);
    return clone;
  }

  /**
   * Merges another Metadata into a new instance.
   * Arrays are concatenated, all other values are overwritten by source.
   */
  merge(source: Metadata): Metadata {
    const result = this.cloneShallow();
    for (const [key, value] of Object.entries(source)) {
      const existing = result.get(key);
      if (Array.isArray(existing) && Array.isArray(value)) {
        result.set(key, [...existing, ...value]);
      } else {
        result.set(key, value);
      }
    }
    return result;
  }

  /**
   * Creates a deep clone. Elements are deep cloned,
   * all other values are deep cloned via ramda clone.
   */
  cloneDeep(): Metadata {
    const copy = new Metadata();
    for (const [key, value] of Object.entries(this)) {
      if (value instanceof this.Element) {
        copy.set(key, this.cloneDeepElement(value));
      } else {
        copy.set(key, clone(value));
      }
    }
    return copy;
  }
}

export default Metadata;
