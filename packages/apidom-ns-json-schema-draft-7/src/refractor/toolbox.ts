import { isStringElement, Namespace } from '@speclynx/apidom-datamodel';

import * as jsonSchemaDraft7Predicates from '../predicates.ts';
import jsonSchemaDraft7Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...jsonSchemaDraft7Predicates, isStringElement };

  namespace.use(jsonSchemaDraft7Namespace);

  return { predicates, namespace };
};

export default createToolbox;
