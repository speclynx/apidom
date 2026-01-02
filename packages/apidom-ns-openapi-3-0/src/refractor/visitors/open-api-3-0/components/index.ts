import { always } from 'ramda';

import ComponentsElement from '../../../../elements/Components.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseFixedFieldsVisitorOptions as ComponentsVisitorOptions };

/**
 * @public
 */
class ComponentsVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ComponentsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Components']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ComponentsElement();
    this.specPath = always(['document', 'objects', 'Components']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ComponentsVisitor;
