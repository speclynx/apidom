import { always } from 'ramda';

import ParametersDefinitionsElement from '../../../../elements/ParametersDefinitions.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as ParametersDefinitionsVisitorOptions };

/**
 * @public
 */
class ParametersDefinitionsVisitor extends BaseMapVisitor {
  declare public readonly element: ParametersDefinitionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Parameter']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ParametersDefinitionsElement();
    this.specPath = always(['document', 'objects', 'Parameter']);
  }
}

export default ParametersDefinitionsVisitor;
