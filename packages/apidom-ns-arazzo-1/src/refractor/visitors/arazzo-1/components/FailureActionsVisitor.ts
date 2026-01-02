import { always } from 'ramda';

import ComponentsFailureActionsElement from '../../../../elements/nces/ComponentsFailureActions.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface FailureActionsVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class FailureActionsVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: ComponentsFailureActionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'FailureAction']>;

  constructor(options: FailureActionsVisitorOptions) {
    super(options);
    this.element = new ComponentsFailureActionsElement();
    this.specPath = always(['document', 'objects', 'FailureAction']);
    this.fieldPatternPredicate = (value: unknown) => /^[a-zA-Z0-9.\-_]+$/.test(String(value));
  }
}

export default FailureActionsVisitor;
