import { always } from 'ramda';

import HttpServerBindingElement from '../../../../../../elements/bindings/http/HttpServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type HttpServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class HttpServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: HttpServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'http', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: HttpServerBindingVisitorOptions) {
    super(options);
    this.element = new HttpServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'http', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default HttpServerBindingVisitor;
