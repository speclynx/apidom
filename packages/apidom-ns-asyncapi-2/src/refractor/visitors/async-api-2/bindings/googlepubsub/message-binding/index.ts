import { always } from 'ramda';

import GooglepubsubMessageBindingElement from '../../../../../../elements/bindings/googlepubsub/GooglepubsubMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type GooglepubsubMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class GooglepubsubMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: GooglepubsubMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'googlepubusb', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: GooglepubsubMessageBindingVisitorOptions) {
    super(options);
    this.element = new GooglepubsubMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'googlepubusb', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default GooglepubsubMessageBindingVisitor;
