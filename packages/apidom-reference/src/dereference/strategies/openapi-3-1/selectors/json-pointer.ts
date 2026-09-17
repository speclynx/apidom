import { Element } from '@speclynx/apidom-datamodel';
import {
  evaluate as jsonPointerEvaluate,
  type EvaluationTrace,
  type JSONPointer,
} from '@speclynx/apidom-json-pointer';

import { schema$idsOf, type SchemaLocation } from '../util.ts';

/**
 * Locates the element addressed by JSON Pointer within ApiDOM fragment, along
 * with the `$id`s of the schemas enclosing it (`element` included). The enclosing
 * schemas are the elements the pointer walks through on its way to the target.
 * @public
 */
export const locate = <T extends Element>(element: T, jsonPointer: JSONPointer): SchemaLocation => {
  const trace: Partial<EvaluationTrace> = { steps: [] };
  const result = jsonPointerEvaluate<Element>(element, jsonPointer, { trace });
  const walkedNodes = [element, ...trace.steps!.map((step) => step.output)];

  // the last walked node is the target itself
  return { element: result, ancestorSchema$ids: schema$idsOf(walkedNodes.slice(0, -1)) };
};
