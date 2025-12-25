import Element, { type Meta, type Attributes } from './Element.ts';

/**
 * NullElement represents a null value in ApiDOM.
 * @public
 */
class NullElement extends Element {
  constructor(content?: null, meta?: Meta, attributes?: Attributes) {
    super(content ?? null, meta, attributes);
    this.element = 'null';
  }

  primitive(): string {
    return 'null';
  }

  /**
   * NullElement cannot have its value changed.
   * @throws Error - NullElement value cannot be modified
   */
  override set(_content?: unknown): this {
    throw new Error('Cannot set the value of null');
  }
}

export default NullElement;
