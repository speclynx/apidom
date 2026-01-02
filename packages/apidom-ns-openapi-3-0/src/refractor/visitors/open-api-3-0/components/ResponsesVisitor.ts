import { ObjectElement, Element, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsResponsesElement from '../../../../elements/nces/ComponentsResponses.ts';
import MapVisitor, { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement, isResponseElement } from '../../../../predicates.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as ResponsesVisitorOptions };

/**
 * @public
 */
class ResponsesVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsResponsesElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Response']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ComponentsResponsesElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Response'];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = MapVisitor.prototype.ObjectElement.call(this, objectElement);

    // decorate every ReferenceElement with metadata about their referencing type
    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'response');
    });

    // decorate every ResponseElement with metadata about their status code
    // @ts-ignore
    this.element.filter(isResponseElement).forEach((value: Element, key: StringElement) => {
      value.meta.set('http-status-code', toValue(key));
    });

    return result;
  }
}

export default ResponsesVisitor;
