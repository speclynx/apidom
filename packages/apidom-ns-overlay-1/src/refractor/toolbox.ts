import { Namespace, isStringElement } from '@speclynx/apidom-datamodel';

import * as overlay1Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import overlay1Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...refractorPredicates, ...overlay1Predicates, isStringElement };

  namespace.use(overlay1Namespace);

  return { predicates, namespace };
};

export default createToolbox;
