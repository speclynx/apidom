import { always } from 'ramda';

import ComponentsActionsElement from '../../../../elements/nces/ComponentsActions.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ActionsVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class ActionsVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: ComponentsActionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ReusableAction']>;

  constructor(options: ActionsVisitorOptions) {
    super(options);
    this.element = new ComponentsActionsElement();
    this.specPath = always(['document', 'objects', 'ReusableAction']);
  }
}

export default ActionsVisitor;
