import { Element, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path, traverse } from '@speclynx/apidom-traverse';

import SelectorElement from '../../../../elements/Selector.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';
import { isSelectorLikeElement } from '../../../predicates.ts';

/**
 * @public
 */
export interface PayloadVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * Payload is `Any` value which can contain Selector Objects at any nesting level.
 * @public
 */
class PayloadVisitor extends BaseSpecificationFallbackVisitor {
  declare public element: Element | SelectorElement;

  enter(path: Path<Element>) {
    super.enter(path);

    this.element = traverse(this.element, {
      ObjectElement: (objectPath: Path<ObjectElement>) => {
        if (!isSelectorLikeElement(objectPath.node)) return;

        const selectorElement = this.toRefractedElement(
          ['document', 'objects', 'Selector'],
          objectPath.node,
        );
        objectPath.replaceWith(selectorElement);
        objectPath.skip();
      },
    });
  }
}

export default PayloadVisitor;
