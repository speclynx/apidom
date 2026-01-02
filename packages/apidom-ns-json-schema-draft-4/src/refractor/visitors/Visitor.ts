import { deepmerge } from '@speclynx/apidom-core';
import { Element, ObjectElement, hasElementSourceMap } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
export interface VisitorOptions {}

/**
 * @public
 */
class Visitor {
  public element!: Element;

  constructor(options: VisitorOptions) {
    Object.assign(this, options);
  }

  public copyMetaAndAttributes(from: Element, to: Element) {
    if (from.meta.length > 0 || to.meta.length > 0) {
      to.meta = deepmerge(to.meta, from.meta) as ObjectElement;
      if (hasElementSourceMap(from)) {
        // avoid deep merging of source maps
        to.meta.set('sourceMap', from.meta.get('sourceMap'));
      }
    }
    if (from.attributes.length > 0 || from.meta.length > 0) {
      to.attributes = deepmerge(to.attributes, from.attributes) as ObjectElement;
    }
  }
}

export default Visitor;
