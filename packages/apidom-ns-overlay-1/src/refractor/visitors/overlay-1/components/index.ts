import { always } from 'ramda';

import ComponentsElement from '../../../../elements/Components.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ComponentsVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ComponentsVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: ComponentsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Components']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ComponentsVisitorOptions) {
    super(options);
    this.element = new ComponentsElement();
    this.specPath = always(['document', 'objects', 'Components']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ComponentsVisitor;
