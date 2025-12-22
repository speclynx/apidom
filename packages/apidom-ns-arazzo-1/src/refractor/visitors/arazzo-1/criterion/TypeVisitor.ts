import { Mixin } from 'ts-mixer';
import { StringElement, ObjectElement } from '@speclynx/apidom-core';

import CriterionExpressionTypeElement from '../../../../elements/CriterionExpressionType.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface TypeVisitorOptions extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class TypeVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  declare public readonly element: StringElement | CriterionExpressionTypeElement;

  ObjectElement(objectElement: ObjectElement): CriterionExpressionTypeElement {
    const specPath = ['document', 'objects', 'CriterionExpressionType'];
    return this.toRefractedElement(specPath, objectElement);
  }
}

export default TypeVisitor;
