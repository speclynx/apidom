import { always } from 'ramda';

import ItemsElement from '../../../../elements/Items.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as ItemsVisitorOptions };

/**
 * @public
 */
class ItemsVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ItemsElement;

  protected readonly specPath: SpecPath<['document', 'objects', 'Items']>;

  protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ItemsElement();
    this.specPath = always(['document', 'objects', 'Items']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ItemsVisitor;
