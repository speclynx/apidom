import { createNamespace, isStringElement, Namespace } from '@speclynx/apidom-core';

import * as arazzo1Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import workflowsNamespace from '../namespace.ts';

/**
 * @public
 */
export type Predicates = typeof arazzo1Predicates &
  typeof refractorPredicates & {
    isStringElement: typeof isStringElement;
  };

/**
 * @public
 */
export interface Toolbox {
  predicates: Predicates;
  namespace: Namespace;
}

const createToolbox = () => {
  const namespace = createNamespace(workflowsNamespace);
  const predicates = {
    ...refractorPredicates,
    ...arazzo1Predicates,
    isStringElement,
  };

  return { predicates, namespace };
};

export default createToolbox;
