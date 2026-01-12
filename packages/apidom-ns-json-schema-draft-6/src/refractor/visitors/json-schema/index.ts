import { ObjectElement, BooleanElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  JSONSchemaVisitor as JSONSchemaDraft4Visitor,
  JSONSchemaVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import JSONSchemaElement from '../../../elements/JSONSchema.ts';

export type { JSONSchemaVisitorOptions };

/**
 * @public
 */
class JSONSchemaVisitor extends JSONSchemaDraft4Visitor {
  // @ts-expect-error - element can be BooleanElement (boolean schemas introduced in draft-6)
  declare public element: JSONSchemaElement | BooleanElement;

  constructor(options: JSONSchemaVisitorOptions) {
    super(options);
    this.element = new JSONSchemaElement();
  }

  get defaultDialectIdentifier(): string {
    return 'http://json-schema.org/draft-06/schema#';
  }

  BooleanElement(path: Path<BooleanElement>) {
    this.enter(path);
    this.element.classes.push('boolean-json-schema');
  }

  handleSchemaIdentifier(objectElement: ObjectElement, identifierKeyword: string = '$id'): void {
    return super.handleSchemaIdentifier(objectElement, identifierKeyword);
  }
}

export default JSONSchemaVisitor;
