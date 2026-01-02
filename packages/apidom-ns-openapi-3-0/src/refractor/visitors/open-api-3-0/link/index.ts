import { always } from 'ramda';
import { isStringElement, ObjectElement } from '@speclynx/apidom-datamodel';

import LinkElement from '../../../../elements/Link.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as LinkVisitorOptions };

/**
 * @public
 */
class LinkVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: LinkElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Link']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new LinkElement();
    this.specPath = always(['document', 'objects', 'Link']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

    // mark this LinkElement with reference metadata
    if (isStringElement(this.element.operationId) || isStringElement(this.element.operationRef)) {
      this.element.classes.push('reference-element');
    }

    return result;
  }
}

export default LinkVisitor;
