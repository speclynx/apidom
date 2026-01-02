import { isStringElement, Namespace } from '@speclynx/apidom-datamodel';

import * as jsonSchemaDraft4Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import jsonSchemaDraft4Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...refractorPredicates, ...jsonSchemaDraft4Predicates, isStringElement };

  namespace.use(jsonSchemaDraft4Namespace);

  return { predicates, namespace };
};

export default createToolbox;
