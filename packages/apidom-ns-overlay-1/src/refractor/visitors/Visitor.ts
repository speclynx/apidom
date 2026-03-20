import { deepmerge } from '@speclynx/apidom-core';
import {
  Element,
  ObjectElement,
  SourceMapElement,
  StyleElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
export interface VisitorOptions {
  readonly consume?: boolean;
}

/**
 * @public
 */
class Visitor {
  public element!: Element;

  protected readonly consume: boolean = false;

  protected consumeSafe: boolean = false;

  constructor(options: VisitorOptions = {}) {
    Object.assign(this, options);
  }

  public copyMetaAndAttributes(from: Element, to: Element) {
    if (!from.isMetaEmpty && !to.isMetaEmpty) {
      to.meta = to.meta.merge(from.meta);
    } else if (!from.isMetaEmpty) {
      to.meta = from.meta.cloneDeep();
    }
    if (!from.isAttributesEmpty && !to.isAttributesEmpty) {
      to.attributes = deepmerge(to.attributes, from.attributes) as ObjectElement;
    } else if (!from.isAttributesEmpty) {
      to.attributes = cloneDeep(from.attributes);
    }
    SourceMapElement.transfer(from, to);
    StyleElement.transfer(from, to);
  }
}

export default Visitor;
