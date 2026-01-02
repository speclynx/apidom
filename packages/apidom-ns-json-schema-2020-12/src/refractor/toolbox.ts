import { isStringElement, Namespace } from '@speclynx/apidom-datamodel';

import * as jsonSchema202012Predicates from '../predicates.ts';
import jsonSchema202012Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  namespace: Namespace;
}

const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = { ...jsonSchema202012Predicates, isStringElement };

  namespace.use(jsonSchema202012Namespace);

  return { predicates, namespace };
};

export default createToolbox;
