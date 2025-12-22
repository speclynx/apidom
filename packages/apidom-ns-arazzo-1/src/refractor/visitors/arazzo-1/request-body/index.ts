import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import RequestBodyElement from '../../../../elements/RequestBody.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import FixedFieldsVisitor, {
  FixedFieldsVisitorOptions,
  SpecPath,
} from '../../generics/FixedFieldsVisitor.ts';

/**
 * @public
 */
export interface RequestBodyVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class RequestBodyVisitor extends Mixin(FixedFieldsVisitor, FallbackVisitor) {
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
