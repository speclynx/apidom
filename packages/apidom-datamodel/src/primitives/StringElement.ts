import Element, { type Meta, type Attributes } from './Element.ts';

/**
 * StringElement represents a string value in ApiDOM.
 * @public
 */
class StringElement extends Element {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'string';
  }

  primitive(): string {
    return 'string';
  }

  /**
   * The length of the string.
   */
  get length(): number {
    return (this.content as string)?.length ?? 0;
  }
}

export default StringElement;
