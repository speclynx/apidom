import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { SpecPath } from '@speclynx/apidom-ns-json-schema-draft-7';

import { BaseSchemaMapVisitor, BaseSchemaMapVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type DependentSchemasVisitorOptions = BaseSchemaMapVisitorOptions;

/**
 * @public
 */
class DependentSchemasVisitor extends BaseSchemaMapVisitor {
  declare public readonly element: ObjectElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'JSONSchema']>;

  constructor(options: DependentSchemasVisitorOptions) {
    super(options);
    this.element = new ObjectElement();
    this.element.classes.push('json-schema-dependentSchemas');
    this.specPath = always(['document', 'objects', 'JSONSchema']);
  }
}

export default DependentSchemasVisitor;
