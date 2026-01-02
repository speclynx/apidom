import { JSONPath } from 'jsonpath-plus';
import { evaluate as jsonPointerEvaluate } from '@speclynx/apidom-json-pointer';
import { Element } from '@speclynx/apidom-datamodel';
import { toValue, cloneDeep } from '@speclynx/apidom-core';

import EvaluationJsonPathError from './errors/EvaluationJsonPathError.ts';

/**
 * @public
 */
export type Evaluate = {
  <T extends Element>(path: string, element: T): Element[];
  <T extends Element>(path: string[], element: T): Element[];
};

/**
 * Evaluates single JSONPath on ApiDOM element.
 * @public
 */
const evaluate: Evaluate = (path, element) => {
  try {
    const json = toValue(element) as object;
    const pointers = JSONPath({
      path,
      json,
      resultType: 'pointer',
    }) as unknown as string[];

    return pointers.map((pointer) => jsonPointerEvaluate<Element>(element, pointer));
  } catch (error: unknown) {
    throw new EvaluationJsonPathError(
      `JSON Path evaluation failed while evaluating "${String(path)}".`,
      { path, element: cloneDeep(element), cause: error },
    );
  }
};

export default evaluate;
