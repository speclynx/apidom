import {
  Namespace,
  isStringElement,
  isArrayElement,
  isObjectElement,
} from '@speclynx/apidom-datamodel';

import * as openApi3_1Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import openApi3_1Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

/**
 * @public
 */
const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = {
    ...refractorPredicates,
    ...openApi3_1Predicates,
    isStringElement,
    isArrayElement,
    isObjectElement,
  };

  namespace.use(openApi3_1Namespace);

  return { predicates, namespace };
};

export default createToolbox;
