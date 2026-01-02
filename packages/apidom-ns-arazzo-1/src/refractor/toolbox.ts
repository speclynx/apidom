import { Namespace, isStringElement } from '@speclynx/apidom-datamodel';

import * as arazzo1Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import arazzo1Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...refractorPredicates, ...arazzo1Predicates, isStringElement };

  namespace.use(arazzo1Namespace);

  return { predicates, namespace };
};

export default createToolbox;
