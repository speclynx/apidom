import { mediaTypes, OpenAPIMediaTypes } from '@speclynx/apidom-ns-openapi-3-1';

/**
 * @public
 */
const jsonMediaTypes = new OpenAPIMediaTypes(
  ...mediaTypes.filterByFormat('generic'),
  ...mediaTypes.filterByFormat('json'),
);

export default jsonMediaTypes;
