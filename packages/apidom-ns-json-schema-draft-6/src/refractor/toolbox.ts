import { isStringElement, Namespace } from '@speclynx/apidom-datamodel';

import * as jsonSchemaDraft6Predicates from '../predicates.ts';
import jsonSchemaDraft6Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...jsonSchemaDraft6Predicates, isStringElement };

  namespace.use(jsonSchemaDraft6Namespace);

  return { predicates, namespace };
};

export default createToolbox;
