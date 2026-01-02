import { ObjectElement } from '@speclynx/apidom-datamodel';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsCorrelationIDsElement from '../../../../elements/nces/ComponentsCorrelationIDs.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type CorrelationIdsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class CorrelationIdsVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsCorrelationIDsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'CorrelationID']
  >;

  constructor(options: CorrelationIdsVisitorOptions) {
    super(options);
    this.element = new ComponentsCorrelationIDsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'CorrelationID'];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'correlationID');
    });

    return result;
  }
}

export default CorrelationIdsVisitor;
