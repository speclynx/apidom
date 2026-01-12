import { always } from 'ramda';
import { ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReusableElement from '../../../../elements/Reusable.ts';
import FixedFieldsVisitor, { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ReferenceVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ReusableVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: ReusableElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Reusable']>;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: ReferenceVisitorOptions) {
    super(options);
    this.element = new ReusableElement();
    this.specPath = always(['document', 'objects', 'Reusable']);
    this.canSupportSpecificationExtensions = false;
  }

  ObjectElement(path: Path<ObjectElement>) {
    const result = FixedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // mark this ReusableElement with reference metadata
    if (isStringElement(this.element.reference)) {
      this.element.classes.push('reference-element');
    }

    return result;
  }
}

export default ReusableVisitor;
