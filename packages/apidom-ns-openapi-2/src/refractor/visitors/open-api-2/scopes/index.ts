import { always } from 'ramda';

import ScopesElement from '../../../../elements/Scopes.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as ScopesVisitorOptions };

/**
 * @public
 */
class ScopesVisitor extends BaseMapVisitor {
  declare public readonly element: ScopesElement;

  declare protected readonly specPath: SpecPath<['value']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ScopesElement();
    this.specPath = always(['value']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ScopesVisitor;
