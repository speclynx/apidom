import { always } from 'ramda';
import { isObjectElement, ObjectElement, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import ResponseElement from '../../../../elements/Response.ts';
import MediaTypeElement from '../../../../elements/MediaType.ts';
import HeaderElement from '../../../../elements/Header.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { isHeaderElement, isMediaTypeElement } from '../../../../predicates.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseFixedFieldsVisitorOptions as ResponseVisitorOptions };

/**
 * @public
 */
class ResponseVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ResponseElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Response']>;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ResponseElement();
    this.specPath = always(['document', 'objects', 'Response']);
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

    // decorate every MediaTypeElement with media type metadata
    if (isObjectElement(this.element.contentField)) {
      this.element.contentField
        .filter(isMediaTypeElement)
        // @ts-ignore
        .forEach((mediaTypeElement: MediaTypeElement, key: StringElement) => {
          mediaTypeElement.meta.set('media-type', toValue(key));
        });
    }

    // decorate every MediaTypeElement with media type metadata
    if (isObjectElement(this.element.headers)) {
      this.element.headers
        .filter(isHeaderElement)
        // @ts-ignore
        .forEach((headerElement: HeaderElement, key: StringElement) => {
          headerElement.meta.set('header-name', toValue(key));
        });
    }

    return result;
  }
}

export default ResponseVisitor;
