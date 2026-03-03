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
      }
    }
    Object.freeze(this);
  }
}

export default Metadata;
