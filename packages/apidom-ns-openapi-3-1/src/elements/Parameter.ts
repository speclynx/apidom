import { ParameterElement } from '@speclynx/apidom-ns-openapi-3-0';

import SchemaElement from './Schema.ts';

/**
 * @public
 */
class Parameter extends ParameterElement {
  get schema(): SchemaElement | undefined {
    return this.get('schema') as SchemaElement | undefined;
  }

  set schema(schema: SchemaElement | undefined) {
    this.set('schema', schema);
  }
}

export default Parameter;
