import { always } from 'ramda';

import OperationElement from '../../../../elements/Operation.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type OperationVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class OperationVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: OperationElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Operation']>;

  constructor(options: OperationVisitorOptions) {
    super(options);
    this.element = new OperationElement();
    this.specPath = always(['document', 'objects', 'Operation']);
  }
}

export default OperationVisitor;
