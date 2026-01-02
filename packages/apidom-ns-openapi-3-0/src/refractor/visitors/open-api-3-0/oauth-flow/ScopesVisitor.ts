import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import OAuthFlowScopesElement from '../../../../elements/nces/OAuthFlowScopes.ts';

export type { BaseMapVisitorOptions as ScopesVisitorOptions };

/**
 * @public
 */
class ScopesVisitor extends BaseMapVisitor {
  declare public readonly element: OAuthFlowScopesElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new OAuthFlowScopesElement();
    this.specPath = always(['value']);
  }
}

export default ScopesVisitor;
