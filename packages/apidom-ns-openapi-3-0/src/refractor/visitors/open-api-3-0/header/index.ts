import { always } from 'ramda';

import HeaderElement from '../../../../elements/Header.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as HeaderVisitorOptions };

/**
 * @public
 */
class HeaderVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: HeaderElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Header']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new HeaderElement();
    this.specPath = always(['document', 'objects', 'Header']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default HeaderVisitor;
