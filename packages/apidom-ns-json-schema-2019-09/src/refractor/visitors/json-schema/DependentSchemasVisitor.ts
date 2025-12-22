import { Mixin } from 'ts-mixer';
import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-core';
import {
  FallbackVisitor,
  FallbackVisitorOptions,
  MapVisitor,
  MapVisitorOptions,
  ParentSchemaAwareVisitor,
  ParentSchemaAwareVisitorOptions,
  SpecPath,
} from '@speclynx/apidom-ns-json-schema-draft-7';

/**
 * @public
 */
export interface DependentSchemasVisitorOptions
  extends MapVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class DependentSchemasVisitor extends Mixin(MapVisitor, ParentSchemaAwareVisitor, FallbackVisitor) {
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
