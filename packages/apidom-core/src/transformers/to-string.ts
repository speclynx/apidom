import { Element, Namespace } from '@speclynx/apidom-datamodel';

import defaultNamespace from '../namespace.ts';
import dehydrate from './dehydrate.ts';

/**
 * Create a refracted string representation of an Element.
 * @public
 */
const toString = (element: Element, namespace: Namespace = defaultNamespace): string => {
  const refractStructure = dehydrate(element, namespace);
  return JSON.stringify(refractStructure);
};

export default toString;
