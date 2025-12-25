import Element, { type Meta, type Attributes } from './Element.ts';

/**
 * NumberElement represents a numeric value in ApiDOM.
 * @public
 */
class NumberElement extends Element {
  constructor(content?: number, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'number';
  }

  primitive(): string {
    return 'number';
  }
}

export default NumberElement;
