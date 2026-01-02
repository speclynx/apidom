import { Element } from '@speclynx/apidom-datamodel';

import serializeValue from './value/index.ts';

/**
 * @public
 */
const serializer = (
  element: Element,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string => JSON.stringify(serializeValue(element), replacer, space);

export default serializer;
