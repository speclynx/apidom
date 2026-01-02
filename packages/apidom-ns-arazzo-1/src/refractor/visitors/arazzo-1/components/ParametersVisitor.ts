import { always } from 'ramda';

import ComponentsParametersElement from '../../../../elements/nces/ComponentsParameters.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ParametersVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class ParametersVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: ComponentsParametersElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Parameter']>;

  constructor(options: ParametersVisitorOptions) {
    super(options);
    this.element = new ComponentsParametersElement();
    this.specPath = always(['document', 'objects', 'Parameter']);
    this.fieldPatternPredicate = (value: unknown) => /^[a-zA-Z0-9.\-_]+$/.test(String(value));
  }
}

export default ParametersVisitor;
