import { deepmerge } from '@speclynx/apidom-core';
import { Element, ObjectElement, SourceMapElement } from '@speclynx/apidom-datamodel';

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
    if (!from.isMetaEmpty || !to.isMetaEmpty) {
      const target = to.isMetaEmpty ? new ObjectElement() : to.meta;
      const source = from.isMetaEmpty ? new ObjectElement() : from.meta;
      to.meta = deepmerge(target, source) as ObjectElement;
    }
    if (!from.isAttributesEmpty || !to.isAttributesEmpty) {
      const target = to.isAttributesEmpty ? new ObjectElement() : to.attributes;
      const source = from.isAttributesEmpty ? new ObjectElement() : from.attributes;
      to.attributes = deepmerge(target, source) as ObjectElement;
    }
    SourceMapElement.transfer(from, to);
  }
}

export default Visitor;
