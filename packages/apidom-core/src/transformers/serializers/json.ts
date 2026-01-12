import { Element } from '@speclynx/apidom-datamodel';

import serializeValue from './value.ts';

/**
 * @public
 */
const serializer = (
  element: Element,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string => JSON.stringify(serializeValue(element), replacer, space);

export default serializer;
