import { always } from 'ramda';
import { StringElement, ObjectElement, isObjectElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import RequestBodyElement from '../../../../elements/RequestBody.ts';
import MediaTypeElement from '../../../../elements/MediaType.ts';
import FixedFieldsVisitor, { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { isMediaTypeElement } from '../../../../predicates.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseFixedFieldsVisitorOptions as RequestBodyVisitorOptions };

/**
 * @public
 */
class RequestBodyVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: RequestBodyElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'RequestBody']>;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new RequestBodyElement();
    this.specPath = always(['document', 'objects', 'RequestBody']);
  }

  ObjectElement(path: Path<ObjectElement>) {
    FixedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // decorate every MediaTypeElement with media type metadata
    if (isObjectElement(this.element.contentField)) {
      this.element.contentField
        .filter(isMediaTypeElement)
        // @ts-ignore
        .forEach((mediaTypeElement: MediaTypeElement, key: StringElement) => {
          mediaTypeElement.meta.set('media-type', toValue(key));
        });
    }
  }
}

export default RequestBodyVisitor;
