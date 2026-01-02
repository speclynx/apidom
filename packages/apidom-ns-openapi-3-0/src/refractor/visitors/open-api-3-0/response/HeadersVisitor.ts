import { ObjectElement, Element, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import ReferenceElement from '../../../../elements/Reference.ts';
import ResponseHeadersElement from '../../../../elements/nces/ResponseHeaders.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isHeaderElement, isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as HeadersVisitorOptions };

/**
 * @public
 */
class HeadersVisitor extends BaseMapVisitor {
  declare public readonly element: ResponseHeadersElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Header']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ResponseHeadersElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Header'];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // decorate every ReferenceElement with metadata about their referencing type
    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'header');
    });

    // decorate every HeaderElement with metadata about their name
    // @ts-ignore
    this.element.forEach((value: Element, key: StringElement): void => {
      if (!isHeaderElement(value)) return;

      const headerName = toValue(key);

      value.meta.set('header-name', headerName);
    });

    return result;
  }
}

export default HeadersVisitor;
