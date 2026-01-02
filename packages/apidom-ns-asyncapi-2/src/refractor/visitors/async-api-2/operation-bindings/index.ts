import { always } from 'ramda';

import OperationBindingsElement from '../../../../elements/OperationBindings.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type OperationBindingsVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class OperationBindingsVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: OperationBindingsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'OperationBindings']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: OperationBindingsVisitorOptions) {
    super(options);
    this.element = new OperationBindingsElement();
    this.specPath = always(['document', 'objects', 'OperationBindings']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default OperationBindingsVisitor;
