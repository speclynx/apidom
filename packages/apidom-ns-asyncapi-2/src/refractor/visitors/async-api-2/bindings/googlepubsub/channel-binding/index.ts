import { always } from 'ramda';

import GooglepubsubChannelBindingElement from '../../../../../../elements/bindings/googlepubsub/GooglepubsubChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type GooglepubsubChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class GooglepubsubChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: GooglepubsubChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'googlepubsub', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: GooglepubsubChannelBindingVisitorOptions) {
    super(options);
    this.element = new GooglepubsubChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'googlepubsub', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default GooglepubsubChannelBindingVisitor;
