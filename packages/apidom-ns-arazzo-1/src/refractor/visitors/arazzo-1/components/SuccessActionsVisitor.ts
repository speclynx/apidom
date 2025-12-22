import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import ComponentsSuccessActionsElement from '../../../../elements/nces/ComponentsSuccessActions.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import MapVisitor, { MapVisitorOptions, SpecPath } from '../../generics/MapVisitor.ts';

/**
 * @public
 */
export interface SuccessActionsVisitorOptions extends MapVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class SuccessActionsVisitor extends Mixin(MapVisitor, FallbackVisitor) {
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
