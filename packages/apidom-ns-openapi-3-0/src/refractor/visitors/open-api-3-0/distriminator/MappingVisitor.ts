import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import DiscriminatorMappingElement from '../../../../elements/nces/DiscriminatorMapping.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as MappingVisitorOptions };

/**
 * @public
 */
class MappingVisitor extends BaseMapVisitor {
  declare public readonly element: DiscriminatorMappingElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new DiscriminatorMappingElement();
    this.specPath = always(['value']);
  }
}

export default MappingVisitor;
