import Element, { type Meta, type Attributes } from '../primitives/Element.ts';

/**
 * RefElement represents a reference to another element in ApiDOM.
 * @public
 */
class RefElement extends Element {
  constructor(content?: unknown, meta?: Meta, attributes?: Attributes) {
    super(content || [], meta, attributes);
    this.element = 'ref';

    if (!this.path) {
      this.path = 'element';
    }
  }

  /**
   * Path of referenced element to transclude instead of element itself.
   * @defaultValue 'element'
   */
  get path(): Element | undefined {
    if (this.hasAttributesProperty('path')) {
      return this.attributes.get('path');
    }
    return undefined;
  }

  set path(newValue: string | Element | undefined) {
    this.attributes.set('path', newValue);
  }
}

export default RefElement;
