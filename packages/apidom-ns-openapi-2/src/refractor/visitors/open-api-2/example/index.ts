import { always } from 'ramda';

import ExampleElement from '../../../../elements/Example.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as ExampleVisitorOptions };

/**
 * @public
 */
class ExampleVisitor extends BaseMapVisitor {
  declare public readonly element: ExampleElement;

  declare protected readonly specPath: SpecPath<['value']>;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ExampleElement();
    this.specPath = always(['value']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default ExampleVisitor;
