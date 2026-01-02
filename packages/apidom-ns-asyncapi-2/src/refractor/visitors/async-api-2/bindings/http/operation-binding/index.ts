import { always } from 'ramda';

import HttpOperationBindingElement from '../../../../../../elements/bindings/http/HttpOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type HttpOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class HttpOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: HttpOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'http', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: HttpOperationBindingVisitorOptions) {
    super(options);
    this.element = new HttpOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'http', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default HttpOperationBindingVisitor;
