import StringElement from '../primitives/StringElement.ts';
import type Element from '../primitives/Element.ts';
import type { Meta, Attributes } from '../types.ts';

/**
 * AnnotationElement represents a parsing annotation (warning or error).
 *
 * The annotation's class indicates its severity:
 * - 'warning' - A non-fatal issue
 * - 'error' - A fatal issue
 *
 * @public
 */
class AnnotationElement extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'annotation';
  }

  /**
   * The annotation code identifying the type of annotation.
   */
  get code(): Element | undefined {
    return this.attributes.get('code');
  }

  set code(value: unknown) {
    this.attributes.set('code', value);
  }
}

export default AnnotationElement;
