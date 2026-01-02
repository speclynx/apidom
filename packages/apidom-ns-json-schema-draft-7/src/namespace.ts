import { NamespacePlugin } from '@speclynx/apidom-datamodel';
import { JSONReferenceElement } from '@speclynx/apidom-ns-json-schema-draft-6';

import JSONSchemaElement from './elements/JSONSchema.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

/**
 * @public
 */
const jsonSchemaDraft7: NamespacePlugin = {
  namespace: (options) => {
    const { base } = options;

    base.register('jSONSchemaDraft7', JSONSchemaElement);
    base.register('jSONReference', JSONReferenceElement);
    base.register('linkDescription', LinkDescriptionElement);

    return base;
  },
};

export default jsonSchemaDraft7;
