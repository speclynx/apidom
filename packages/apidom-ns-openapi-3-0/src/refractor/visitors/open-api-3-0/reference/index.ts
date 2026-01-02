import { always } from 'ramda';
import { ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';

import ReferenceElement from '../../../../elements/Reference.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseFixedFieldsVisitorOptions as ReferenceVisitorOptions };

/**
 * @public
 */
class ReferenceVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ReferenceElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Reference']>;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ReferenceElement();
    this.specPath = always(['document', 'objects', 'Reference']);
    this.canSupportSpecificationExtensions = false;
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

    // mark this ReferenceElement with reference metadata
    if (isStringElement(this.element.$ref)) {
      this.element.classes.push('reference-element');
    }

    return result;
  }
}

export default ReferenceVisitor;
