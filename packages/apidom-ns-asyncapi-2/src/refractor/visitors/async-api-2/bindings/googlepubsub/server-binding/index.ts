import { always } from 'ramda';

import GooglepubsubServerBindingElement from '../../../../../../elements/bindings/googlepubsub/GooglepubsubServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type GooglepubsubServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class GooglepubsubServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: GooglepubsubServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'googlepubsub', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: GooglepubsubServerBindingVisitorOptions) {
    super(options);
    this.element = new GooglepubsubServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'googlepubsub', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default GooglepubsubServerBindingVisitor;
