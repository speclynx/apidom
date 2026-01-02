import { isStringElement, Namespace } from '@speclynx/apidom-datamodel';

import * as openApi2Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import openApi2Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...refractorPredicates, ...openApi2Predicates, isStringElement };

  namespace.use(openApi2Namespace);

  return { predicates, namespace };
};

export default createToolbox;
