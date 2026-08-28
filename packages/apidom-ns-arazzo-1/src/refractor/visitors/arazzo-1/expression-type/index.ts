import { always } from 'ramda';

import ExpressionTypeElement from '../../../../elements/ExpressionType.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ExpressionTypeVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ExpressionTypeVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: ExpressionTypeElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ExpressionType']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ExpressionTypeVisitorOptions) {
    super(options);
    this.element = new ExpressionTypeElement();
    this.specPath = always(['document', 'objects', 'ExpressionType']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ExpressionTypeVisitor;
