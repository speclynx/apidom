import { always } from 'ramda';

import PayloadReplacementElement from '../../../../elements/PayloadReplacement.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface PayloadReplacementVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class PayloadReplacementVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: PayloadReplacementElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'PayloadReplacement']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: PayloadReplacementVisitorOptions) {
    super(options);
    this.element = new PayloadReplacementElement();
    this.specPath = always(['document', 'objects', 'PayloadReplacement']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default PayloadReplacementVisitor;
