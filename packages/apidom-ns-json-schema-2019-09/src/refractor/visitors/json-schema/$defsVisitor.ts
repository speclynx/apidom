import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { SpecPath } from '@speclynx/apidom-ns-json-schema-draft-7';

import { BaseSchemaMapVisitor, BaseSchemaMapVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type $defsVisitorOptions = BaseSchemaMapVisitorOptions;

/**
 * @public
 */
class $defsVisitor extends BaseSchemaMapVisitor {
  declare public readonly element: ObjectElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'JSONSchema']>;

  constructor(options: $defsVisitorOptions) {
    super(options);
    this.element = new ObjectElement();
    this.element.classes.push('json-schema-$defs');
    this.specPath = always(['document', 'objects', 'JSONSchema']);
  }
}

export default $defsVisitor;
