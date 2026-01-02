import ServerVariablesElement from '../../../../elements/nces/ServerVariables.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import type { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';

/**
 * @public
 */
export type VariablesVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class VariablesVisitor extends BaseMapVisitor {
  declare public readonly element: ServerVariablesElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'ServerVariable']
  >;

  constructor(options: VariablesVisitorOptions) {
    super(options);
    this.element = new ServerVariablesElement();
    this.specPath = (element: unknown) => {
      return isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'ServerVariable'];
    };
  }
}

export default VariablesVisitor;
