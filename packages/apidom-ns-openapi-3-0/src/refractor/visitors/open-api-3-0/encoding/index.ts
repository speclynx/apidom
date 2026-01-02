import { always } from 'ramda';
import { isObjectElement, ObjectElement, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import EncodingElement from '../../../../elements/Encoding.ts';
import HeaderElement from '../../../../elements/Header.ts';
import FixedFieldsVisitor, { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { isHeaderElement } from '../../../../predicates.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseFixedFieldsVisitorOptions as EncodingVisitorOptions };

/**
 * @public
 */
class EncodingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: EncodingElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Encoding']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new EncodingElement();
    this.specPath = always(['document', 'objects', 'Encoding']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = FixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

    // decorate every Header with media type metadata
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

export default EncodingVisitor;
