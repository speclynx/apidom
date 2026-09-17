import { Element } from '@speclynx/apidom-datamodel';
import {
  evaluate as jsonPointerEvaluate,
  type EvaluationTrace,
  type JSONPointer,
} from '@speclynx/apidom-json-pointer';

import { schema$idsOf, type SchemaLocation } from '../util.ts';

/**
 * Locates the element addressed by JSON Pointer within ApiDOM fragment, along
 * with the `$id`s of the schemas enclosing it: the elements the pointer walks
 * through on its way to the target, the search root included.
 * @public
 */
export const locate = <T extends Element>(element: T, jsonPointer: JSONPointer): SchemaLocation => {
  const trace: Partial<EvaluationTrace> = { steps: [] };
  const result = jsonPointerEvaluate<Element>(element, jsonPointer, { trace });

  // each step's input is the node the token was applied to, so the inputs are
  // exactly the walked nodes minus the target
  return {
    element: result,
    ancestorSchema$ids: schema$idsOf(trace.steps!.map((step) => step.input)),
  };
};
