import { complement } from 'ramda';
import { Element } from '@speclynx/apidom-datamodel';

import filter from './filter.ts';

/**
 * Complement of filter.
 * @public
 */
const reject = <T extends Element>(predicate: (element: any) => boolean, element: T): Element[] => {
  return filter(complement(predicate), element);
};

export default reject;
