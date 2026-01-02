import { always } from 'ramda';

import CriterionExpressionTypeElement from '../../../../elements/CriterionExpressionType.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface CriterionExpressionTypeVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class CriterionExpressionTypeVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: CriterionExpressionTypeElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'CriterionExpressionType']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: CriterionExpressionTypeVisitorOptions) {
    super(options);
    this.element = new CriterionExpressionTypeElement();
    this.specPath = always(['document', 'objects', 'CriterionExpressionType']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default CriterionExpressionTypeVisitor;
