import { NamespacePlugin } from '@speclynx/apidom-datamodel';

import JSONSchemaElement from './elements/JSONSchema.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

/**
 * @public
 */
const jsonSchema202012: NamespacePlugin = {
  namespace: (options) => {
    const { base } = options;

    base.register('jSONSchema202012', JSONSchemaElement);
    base.register('linkDescription', LinkDescriptionElement);

    return base;
  },
};

export default jsonSchema202012;
