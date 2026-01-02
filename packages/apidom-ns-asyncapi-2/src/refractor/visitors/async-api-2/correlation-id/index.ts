import { always } from 'ramda';

import CorrelationIDElement from '../../../../elements/CorrelationID.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type CorrelationIDVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class CorrelationIDVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: CorrelationIDElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'CorrelationID']>;

  constructor(options: CorrelationIDVisitorOptions) {
    super(options);
    this.element = new CorrelationIDElement();
    this.specPath = always(['document', 'objects', 'CorrelationID']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default CorrelationIDVisitor;
