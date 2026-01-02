import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { SpecPath } from '../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as ContentVisitorOptions };

/**
 * @public
 */
class ContentVisitor extends BaseMapVisitor {
  declare public readonly element: ObjectElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'MediaType']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ObjectElement();
    this.element.classes.push('content');
    this.specPath = always(['document', 'objects', 'MediaType']);
  }
}

export default ContentVisitor;
