import { always } from 'ramda';

import ResponseElement from '../../../../elements/Response.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as ResponseVisitorOptions };

/**
 * @public
 */
class ResponseVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ResponseElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Response']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ResponseElement();
    this.specPath = always(['document', 'objects', 'Response']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ResponseVisitor;
