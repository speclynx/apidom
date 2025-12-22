import { Mixin } from 'ts-mixer';
import { always } from 'ramda';
import { ObjectElement, isStringElement } from '@speclynx/apidom-core';

import ReusableElement from '../../../../elements/Reusable.ts';
import FixedFieldsVisitor, {
  FixedFieldsVisitorOptions,
  SpecPath,
} from '../../generics/FixedFieldsVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface ReferenceVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class ReusableVisitor extends Mixin(FixedFieldsVisitor, FallbackVisitor) {
  declare public readonly element: ReusableElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Reusable']>;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: ReferenceVisitorOptions) {
    super(options);
    this.element = new ReusableElement();
    this.specPath = always(['document', 'objects', 'Reusable']);
    this.canSupportSpecificationExtensions = false;
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = FixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

    // mark this ReusableElement with reference metadata
    if (isStringElement(this.element.reference)) {
      this.element.classes.push('reference-element');
    }

    return result;
  }
}

export default ReusableVisitor;
