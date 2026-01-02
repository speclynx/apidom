import { always } from 'ramda';

import RequestBodyElement from '../../../../elements/RequestBody.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface RequestBodyVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class RequestBodyVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: RequestBodyElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'RequestBody']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: RequestBodyVisitorOptions) {
    super(options);
    this.element = new RequestBodyElement();
    this.specPath = always(['document', 'objects', 'RequestBody']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default RequestBodyVisitor;
