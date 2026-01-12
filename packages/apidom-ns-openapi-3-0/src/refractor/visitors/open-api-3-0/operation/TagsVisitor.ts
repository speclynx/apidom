import { ArrayElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import OperationTagsElement from '../../../../elements/nces/OperationTags.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface TagsVisitorOptions extends FallbackVisitorOptions {}

/**
 * @public
 */
class TagsVisitor extends FallbackVisitor {
  declare public element: OperationTagsElement;

  constructor(options: TagsVisitorOptions) {
    super(options);
    this.element = new OperationTagsElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    this.element = this.element.concat(cloneDeep(arrayElement));

    path.stop();
  }
}

export default TagsVisitor;
