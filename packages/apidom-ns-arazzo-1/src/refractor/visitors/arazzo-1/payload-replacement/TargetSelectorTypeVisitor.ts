import { StringElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ExpressionTypeElement from '../../../../elements/ExpressionType.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface TargetSelectorTypeVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class TargetSelectorTypeVisitor extends BaseSpecificationFallbackVisitor {
  declare public element: StringElement | ExpressionTypeElement;

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;
    const specPath = ['document', 'objects', 'ExpressionType'];

    this.element = this.toRefractedElement(specPath, objectElement);

    path.stop();
  }
}

export default TargetSelectorTypeVisitor;
