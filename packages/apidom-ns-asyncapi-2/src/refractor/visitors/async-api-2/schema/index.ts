import { always } from 'ramda';
import { ObjectElement, BooleanElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  ObjectElement(path: Path<ObjectElement>) {
    this.element = new SchemaElement();

    BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, path);
  }

  BooleanElement(path: Path<BooleanElement>) {
    super.enter(path);
    this.element.classes.push('boolean-json-schema');
  }
}

export default SchemaVisitor;
