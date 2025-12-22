import {
  JSONSchemaVisitor as JSONSchema202012Visitor,
  JSONSchemaVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';

import JSONSchemaElement from '../../../../elements/JSONSchema.ts';

export type { JSONSchemaVisitorOptions };

/**
 * @public
 */
class JSONSchemaVisitor extends JSONSchema202012Visitor {
  declare public element: JSONSchemaElement;

  constructor(options: JSONSchemaVisitorOptions) {
    super(options);
    this.element = new JSONSchemaElement();
  }
}

export default JSONSchemaVisitor;
