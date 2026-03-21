import { mediaTypes, OverlayMediaTypes } from '@speclynx/apidom-ns-overlay-1';

/**
 * @public
 */
const jsonMediaTypes = new OverlayMediaTypes(
  ...mediaTypes.filterByFormat('generic'),
  ...mediaTypes.filterByFormat('json'),
);

export default jsonMediaTypes;
