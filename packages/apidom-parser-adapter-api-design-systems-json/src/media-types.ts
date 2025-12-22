import { mediaTypes, ApiDesignSystemsMediaTypes } from '@speclynx/apidom-ns-api-design-systems';

/**
 * @public
 */
const jsonMediaTypes = new ApiDesignSystemsMediaTypes(
  ...mediaTypes.filterByFormat('generic'),
  ...mediaTypes.filterByFormat('json'),
);

export default jsonMediaTypes;
