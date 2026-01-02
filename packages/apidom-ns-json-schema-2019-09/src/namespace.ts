import { NamespacePlugin } from '@speclynx/apidom-datamodel';

import JSONSchemaElement from './elements/JSONSchema.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

/**
 * @public
 */
const jsonSchema201909: NamespacePlugin = {
  namespace: (options) => {
    const { base } = options;

    base.register('jSONSchema201909', JSONSchemaElement);
    base.register('linkDescription', LinkDescriptionElement);

    return base;
  },
};

export default jsonSchema201909;
