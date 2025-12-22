import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import PayloadReplacementElement from '../../../../elements/PayloadReplacement.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import FixedFieldsVisitor, {
  FixedFieldsVisitorOptions,
  SpecPath,
} from '../../generics/FixedFieldsVisitor.ts';

/**
 * @public
 */
export interface PayloadReplacementVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class PayloadReplacementVisitor extends Mixin(FixedFieldsVisitor, FallbackVisitor) {
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
