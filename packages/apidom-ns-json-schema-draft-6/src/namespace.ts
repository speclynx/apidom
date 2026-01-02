import { NamespacePlugin } from '@speclynx/apidom-datamodel';
import { JSONReferenceElement, MediaElement } from '@speclynx/apidom-ns-json-schema-draft-4';

import JSONSchemaElement from './elements/JSONSchema.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

/**
 * @public
 */
const jsonSchemaDraft6: NamespacePlugin = {
  namespace: (options) => {
    const { base } = options;

    base.register('jSONSchemaDraft6', JSONSchemaElement);
    base.register('jSONReference', JSONReferenceElement);
    base.register('media', MediaElement);
    base.register('linkDescription', LinkDescriptionElement);

    return base;
  },
};

export default jsonSchemaDraft6;
