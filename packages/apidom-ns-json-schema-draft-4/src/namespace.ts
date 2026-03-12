import { NamespacePlugin } from '@speclynx/apidom-datamodel';

import JSONSchemaElement from './elements/JSONSchema.ts';
import JSONReferenceElement from './elements/JSONReference.ts';
import MediaElement from './elements/Media.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

/**
 * @public
 */
const jsonSchemaDraft4: NamespacePlugin = {
  namespace: (options) => {
    const { base } = options;

    base.register('JSONSchemaDraft4', JSONSchemaElement);
    base.register('JSONReference', JSONReferenceElement);
    base.register('media', MediaElement);
    base.register('linkDescription', LinkDescriptionElement);

    return base;
  },
};

export default jsonSchemaDraft4;
