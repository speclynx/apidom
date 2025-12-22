import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import ComponentsFailureActionsElement from '../../../../elements/nces/ComponentsFailureActions.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import MapVisitor, { MapVisitorOptions, SpecPath } from '../../generics/MapVisitor.ts';

/**
 * @public
 */
export interface FailureActionsVisitorOptions extends MapVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class FailureActionsVisitor extends Mixin(MapVisitor, FallbackVisitor) {
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
