import { ObjectElement, Element, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsHeadersElement from '../../../../elements/nces/ComponentsHeaders.ts';
import MapVisitor, { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement, isHeaderElement } from '../../../../predicates.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as HeadersVisitorOptions };

/**
 * @public
 */
class HeadersVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsHeadersElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Header']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ComponentsHeadersElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Header'];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = MapVisitor.prototype.ObjectElement.call(this, objectElement);

    // decorate every ReferenceElement with metadata about their referencing type
    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'header');
    });

    // decorate every HeaderElement with metadata about their name
    // @ts-ignore
    this.element.filter(isHeaderElement).forEach((value: Element, key: StringElement) => {
      value.meta.set('header-name', toValue(key));
    });

    return result;
  }
}

export default HeadersVisitor;
