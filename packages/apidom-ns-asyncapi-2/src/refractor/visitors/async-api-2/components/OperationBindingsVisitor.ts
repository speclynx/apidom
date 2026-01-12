import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsOperationBindingsElement from '../../../../elements/nces/ComponentsOperationBindings.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type OperationBindingsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class OperationBindingsVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsOperationBindingsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'OperationBindings']
  >;

  constructor(options: OperationBindingsVisitorOptions) {
    super(options);
    this.element = new ComponentsOperationBindingsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'OperationBindings'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'operationBindings');
    });
  }
}

export default OperationBindingsVisitor;
