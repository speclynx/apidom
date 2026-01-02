import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import ServerVariablesElement from '../../../../elements/nces/ServerVariables.ts';

export type { BaseMapVisitorOptions as VariablesVisitorOptions };

/**
 * @public
 */
class VariablesVisitor extends BaseMapVisitor {
  declare public readonly element: ServerVariablesElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ServerVariable']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ServerVariablesElement();
    this.specPath = always(['document', 'objects', 'ServerVariable']);
  }
}

export default VariablesVisitor;
