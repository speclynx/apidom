import { always } from 'ramda';

import HttpMessageBindingElement from '../../../../../../elements/bindings/http/HttpMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type HttpMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class HttpMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: HttpMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'http', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: HttpMessageBindingVisitorOptions) {
    super(options);
    this.element = new HttpMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'http', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default HttpMessageBindingVisitor;
