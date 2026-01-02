import { StringElement, ObjectElement } from '@speclynx/apidom-datamodel';

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

  ObjectElement(objectElement: ObjectElement): CriterionExpressionTypeElement {
    const specPath = ['document', 'objects', 'CriterionExpressionType'];
    return this.toRefractedElement(specPath, objectElement);
  }
}

export default TypeVisitor;
