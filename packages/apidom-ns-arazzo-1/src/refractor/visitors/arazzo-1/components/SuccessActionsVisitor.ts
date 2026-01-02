import { always } from 'ramda';

import ComponentsSuccessActionsElement from '../../../../elements/nces/ComponentsSuccessActions.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface SuccessActionsVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class SuccessActionsVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: ComponentsSuccessActionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'SuccessAction']>;

  constructor(options: SuccessActionsVisitorOptions) {
    super(options);
    this.element = new ComponentsSuccessActionsElement();
    this.specPath = always(['document', 'objects', 'SuccessAction']);
    this.fieldPatternPredicate = (value: unknown) => /^[a-zA-Z0-9.\-_]+$/.test(String(value));
  }
}

export default SuccessActionsVisitor;
