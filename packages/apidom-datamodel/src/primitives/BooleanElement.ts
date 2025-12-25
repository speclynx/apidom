import Element, { type Meta, type Attributes } from './Element.ts';

/**
 * BooleanElement represents a boolean value in ApiDOM.
 * @public
 */
class BooleanElement extends Element {
  constructor(content?: boolean, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'boolean';
  }

  primitive(): string {
    return 'boolean';
  }
}

export default BooleanElement;
