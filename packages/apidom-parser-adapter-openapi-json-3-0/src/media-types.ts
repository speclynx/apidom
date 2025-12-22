import { mediaTypes, OpenAPIMediaTypes } from '@speclynx/apidom-ns-openapi-3-0';

/**
 * @public
 */
const jsonMediaTypes = new OpenAPIMediaTypes(
  ...mediaTypes.filterByFormat('generic'),
  ...mediaTypes.filterByFormat('json'),
);

export default jsonMediaTypes;
