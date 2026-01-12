import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsServerVariablesElement from '../../../../elements/nces/ComponentsServerVariables.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ServerVariablesVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class ServerVariablesVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsServerVariablesElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'ServerVariable']
  >;

  constructor(options: ServerVariablesVisitorOptions) {
    super(options);
    this.element = new ComponentsServerVariablesElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'ServerVariable'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'serverVariable');
    });
  }
}

export default ServerVariablesVisitor;
