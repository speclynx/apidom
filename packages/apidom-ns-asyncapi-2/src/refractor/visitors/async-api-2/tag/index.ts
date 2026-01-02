import { always } from 'ramda';

import TagElement from '../../../../elements/Tag.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type TagVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class TagVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: TagElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Tag']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: TagVisitorOptions) {
    super(options);
    this.element = new TagElement();
    this.specPath = always(['document', 'objects', 'Tag']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default TagVisitor;
