import { ObjectElement } from '@speclynx/apidom-datamodel';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsOperationTraitsElement from '../../../../elements/nces/ComponentsOperationTraits.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type OperationTraitsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class OperationTraitsVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsOperationTraitsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'OperationTrait']
  >;

  constructor(options: OperationTraitsVisitorOptions) {
    super(options);
    this.element = new ComponentsOperationTraitsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'OperationTrait'];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'operationTrait');
    });

    return result;
  }
}

export default OperationTraitsVisitor;
