import { StringElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import CriterionExpressionTypeElement from '../../../../elements/CriterionExpressionType.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';

/**
 * @public
 */
export interface TypeVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class TypeVisitor extends BaseSpecificationFallbackVisitor {
  declare public readonly element: StringElement | CriterionExpressionTypeElement;

  ObjectElement(path: Path<ObjectElement>): CriterionExpressionTypeElement {
    const objectElement = path.node;
    const specPath = ['document', 'objects', 'CriterionExpressionType'];
    return this.toRefractedElement(specPath, objectElement);
  }
}

export default TypeVisitor;
