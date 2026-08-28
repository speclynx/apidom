import { Element, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SelectorElement from '../../../../elements/Selector.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';
import { isSelectorLikeElement } from '../../../predicates.ts';

/**
 * @public
 */
export interface ValueVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class ValueVisitor extends BaseSpecificationFallbackVisitor {
  declare public element: Element | SelectorElement;

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;

    if (isSelectorLikeElement(objectElement)) {
      this.element = this.toRefractedElement(['document', 'objects', 'Selector'], objectElement);
      path.stop();
      return;
    }

    this.enter(path);
  }
}

export default ValueVisitor;
