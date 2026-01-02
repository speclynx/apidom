import { always } from 'ramda';

import OAuthFlowScopesElement from '../../../../elements/nces/OAuthFlowScopes.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ScopesVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class ScopesVisitor extends BaseMapVisitor {
  declare public readonly element: OAuthFlowScopesElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: ScopesVisitorOptions) {
    super(options);
    this.element = new OAuthFlowScopesElement();
    this.specPath = always(['value']);
  }
}

export default ScopesVisitor;
