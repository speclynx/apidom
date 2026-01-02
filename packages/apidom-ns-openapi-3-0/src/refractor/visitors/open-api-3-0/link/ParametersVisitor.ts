import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import LinkParametersElement from '../../../../elements/nces/LinkParameters.ts';

export type { BaseMapVisitorOptions as ParametersVisitorOptions };

/**
 * @public
 */
class ParametersVisitor extends BaseMapVisitor {
  declare public readonly element: LinkParametersElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new LinkParametersElement();
    this.specPath = always(['value']);
  }
}

export default ParametersVisitor;
