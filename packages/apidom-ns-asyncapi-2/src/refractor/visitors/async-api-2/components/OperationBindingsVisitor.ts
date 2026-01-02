import { ObjectElement } from '@speclynx/apidom-datamodel';

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

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'operationBindings');
    });

    return result;
  }
}

export default OperationBindingsVisitor;
