import { isStringElement, Namespace } from '@speclynx/apidom-datamodel';

import * as jsonSchema201909Predicates from '../predicates.ts';
import jsonSchema201909Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...jsonSchema201909Predicates, isStringElement };

  namespace.use(jsonSchema201909Namespace);

  return { predicates, namespace };
};

export default createToolbox;
