import { always } from 'ramda';

import ContactElement from '../../../../elements/Contact.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ContactVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class ContactVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ContactElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Contact']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ContactVisitorOptions) {
    super(options);
    this.element = new ContactElement();
    this.specPath = always(['document', 'objects', 'Contact']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ContactVisitor;
