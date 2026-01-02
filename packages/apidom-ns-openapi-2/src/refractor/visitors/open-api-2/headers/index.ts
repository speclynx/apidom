import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import HeadersElement from '../../../../elements/Headers.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as HeadersVisitorOptions };

/**
 * @public
 */
class HeadersVisitor extends BaseMapVisitor {
  declare public readonly element: HeadersElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Header']>;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new HeadersElement();
    this.specPath = always(['document', 'objects', 'Header']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default HeadersVisitor;
