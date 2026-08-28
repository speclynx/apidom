import { always } from 'ramda';

import SelectorElement from '../../../../elements/Selector.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface SelectorVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class SelectorVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: SelectorElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Selector']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: SelectorVisitorOptions) {
    super(options);
    this.element = new SelectorElement();
    this.specPath = always(['document', 'objects', 'Selector']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default SelectorVisitor;
