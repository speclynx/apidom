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
export interface TypeVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class TypeVisitor extends BaseSpecificationFallbackVisitor {
  declare public readonly element: StringElement | ExpressionTypeElement;

  ObjectElement(path: Path<ObjectElement>): ExpressionTypeElement {
    const objectElement = path.node;
    const specPath = ['document', 'objects', 'ExpressionType'];
    return this.toRefractedElement(specPath, objectElement);
  }
}

export default TypeVisitor;
