import { Element, Namespace } from '@speclynx/apidom-datamodel';

import defaultNamespaceInstance from '../namespace.ts';

/**
 * Creates a refract representation of an Element.
 * https://github.com/refractproject/refract-spec
 * @public
 */
const dehydrate = (element: Element, namespace: Namespace = defaultNamespaceInstance): unknown => {
  return namespace.toRefract(element);
};

export default dehydrate;
