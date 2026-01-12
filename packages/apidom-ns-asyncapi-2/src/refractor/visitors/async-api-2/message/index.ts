import { always, defaultTo } from 'ramda';
import { ObjectElement, isObjectElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import mediaTypes from '../../../../media-types.ts';
import MessageElement from '../../../../elements/Message.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';

/**
 * Implementation of refracting according `schemaFormat` fixed field is now limited,
 * and currently only supports `AsyncAPI Schema Object >= 2.0.0 <=2.6.0.`
 * @public
 */
export type MessageVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MessageVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MessageElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Message']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: MessageVisitorOptions) {
    super(options);
    this.element = new MessageElement();
    this.specPath = always(['document', 'objects', 'Message']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, path);
    const objectElement = path.node;
    const payload = this.element.get('payload');
    const schemaFormat = defaultTo(
      mediaTypes.latest(),
      toValue(objectElement.get('schemaFormat')) as string,
    );

    if (mediaTypes.includes(schemaFormat as string) && isReferenceLikeElement(payload)) {
      // refract to ReferenceElement
      const referenceElement = this.toRefractedElement(
        ['document', 'objects', 'Reference'],
        payload,
      );
      referenceElement.meta.set('referenced-element', 'schema');
      this.element.payload = referenceElement;
    } else if (
      mediaTypes.includes(schemaFormat as string) &&
      isObjectElement(this.element.payload)
    ) {
      this.element.payload = this.toRefractedElement(['document', 'objects', 'Schema'], payload);
    }
  }
}

export default MessageVisitor;
