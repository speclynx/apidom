import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import CriterionExpressionTypeElement from '../../../../elements/CriterionExpressionType.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import FixedFieldsVisitor, {
  FixedFieldsVisitorOptions,
  SpecPath,
} from '../../generics/FixedFieldsVisitor.ts';

/**
 * @public
 */
export interface CriterionExpressionTypeVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class CriterionExpressionTypeVisitor extends Mixin(FixedFieldsVisitor, FallbackVisitor) {
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
