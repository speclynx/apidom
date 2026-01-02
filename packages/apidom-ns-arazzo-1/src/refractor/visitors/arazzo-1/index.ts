import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { SpecPath } from '../generics/FixedFieldsVisitor.ts';
import FixedFieldsVisitor from '../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from './bases.ts';
import ArazzoSpecification1Element from '../../../elements/ArazzoSpecification1.ts';

/**
 * @public
 */
export interface ArazzoSpecificationVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ArazzoSpecificationVisitor extends BaseFixedFieldsFallbackVisitor {
  public readonly element: ArazzoSpecification1Element;

  protected readonly specPath: SpecPath<['document', 'objects', 'ArazzoSpecification']>;

  protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ArazzoSpecificationVisitorOptions) {
    super(options);
    this.element = new ArazzoSpecification1Element();
    this.specPath = always(['document', 'objects', 'ArazzoSpecification']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(objectElement: ObjectElement) {
    return FixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);
  }
}

export default ArazzoSpecificationVisitor;
