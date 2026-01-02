import { always } from 'ramda';

import { SpecPath } from '../generics/FixedFieldsVisitor.ts';
import AsyncApi2Element from '../../../elements/AsyncApi2.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type AsyncApi2VisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class AsyncApi2Visitor extends BaseFixedFieldsVisitor {
  declare public readonly element: AsyncApi2Element;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'AsyncApi']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: AsyncApi2VisitorOptions) {
    super(options);
    this.element = new AsyncApi2Element();
    this.specPath = always(['document', 'objects', 'AsyncApi']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default AsyncApi2Visitor;
