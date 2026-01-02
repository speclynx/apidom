import { Namespace, isStringElement } from '@speclynx/apidom-datamodel';

import * as asyncApi2Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import asyncApi2Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...refractorPredicates, ...asyncApi2Predicates, isStringElement };

  namespace.use(asyncApi2Namespace);

  return { predicates, namespace };
};

export default createToolbox;
