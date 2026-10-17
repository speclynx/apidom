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
   * An empty YAML node (YAML 1.2 §7.2) is a null parsed as an empty string with the `yaml-e-node`
   * class; while it's still empty, its value is null.
   */
  toValue(): string | null {
    const value = super.toValue() as string;
    // the classes getter would add empty classes to an element without them
    const isEmptyNode = this.hasMetaProperty('classes') && this.classes.includes('yaml-e-node');
    return value === '' && isEmptyNode ? null : value;
  }

  /**
   * The length of the string.
   */
  get length(): number {
    return (this.content as string)?.length ?? 0;
  }
}

export default StringElement;
