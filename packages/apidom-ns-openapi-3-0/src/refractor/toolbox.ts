import { isStringElement, Namespace } from '@speclynx/apidom-datamodel';

import * as openApi3_0Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import openApi3_0Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...refractorPredicates, ...openApi3_0Predicates, isStringElement };

  namespace.use(openApi3_0Namespace);

  return { predicates, namespace };
};

export default createToolbox;
