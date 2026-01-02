import { Element, ObjectElement, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import MapVisitor, { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isHeaderElement, isReferenceElement } from '../../../../predicates.ts';
import EncodingHeadersElement from '../../../../elements/nces/EncodingHeaders.ts';
import ReferenceElement from '../../../../elements/Reference.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as HeadersVisitorOptions };

/**
 * @public
 */
class HeadersVisitor extends BaseMapVisitor {
  declare public readonly element: EncodingHeadersElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Header']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new EncodingHeadersElement();
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
    this.element.forEach((value: Element, key: StringElement): void => {
      if (!isHeaderElement(value)) return;

      const headerName = toValue(key);

      value.meta.set('headerName', headerName);
    });

    return result;
  }
}

export default HeadersVisitor;
