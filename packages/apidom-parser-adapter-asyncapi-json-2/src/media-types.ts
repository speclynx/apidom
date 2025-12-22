import { mediaTypes, AsyncAPIMediaTypes } from '@speclynx/apidom-ns-asyncapi-2';

/**
 * @public
 */
const jsonMediaTypes = new AsyncAPIMediaTypes(
  ...mediaTypes.filterByFormat('generic'),
  ...mediaTypes.filterByFormat('json'),
);

export default jsonMediaTypes;
