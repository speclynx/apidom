import { always } from 'ramda';
import { ObjectElement, BooleanElement } from '@speclynx/apidom-datamodel';

import SchemaElement from '../../../../elements/Schema.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type SchemaVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class SchemaVisitor extends BaseFixedFieldsVisitor {
  declare public element: SchemaElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Schema']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: SchemaVisitorOptions) {
    super(options);
    this.specPath = always(['document', 'objects', 'Schema']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(objectElement: ObjectElement) {
    this.element = new SchemaElement();

    return BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);
  }

  BooleanElement(booleanElement: BooleanElement) {
    const result = super.enter(booleanElement);
    this.element.classes.push('boolean-json-schema');

    return result;
  }
}

export default SchemaVisitor;
