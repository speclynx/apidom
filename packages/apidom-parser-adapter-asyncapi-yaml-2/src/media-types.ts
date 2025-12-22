import { mediaTypes, AsyncAPIMediaTypes } from '@speclynx/apidom-ns-asyncapi-2';

/**
 * @public
 */
const yamlMediaTypes = new AsyncAPIMediaTypes(
  ...mediaTypes.filterByFormat('generic'),
  ...mediaTypes.filterByFormat('yaml'),
);

export default yamlMediaTypes;
