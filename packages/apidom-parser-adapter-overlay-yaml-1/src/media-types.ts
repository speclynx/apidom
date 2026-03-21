import { mediaTypes, OverlayMediaTypes } from '@speclynx/apidom-ns-overlay-1';

/**
 * @public
 */
const yamlMediaTypes = new OverlayMediaTypes(
  ...mediaTypes.filterByFormat('generic'),
  ...mediaTypes.filterByFormat('yaml'),
);

export default yamlMediaTypes;
