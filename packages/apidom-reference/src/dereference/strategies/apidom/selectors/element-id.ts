import { isUndefined } from 'ramda-adjunct';
import { Element, isElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { filter } from '@speclynx/apidom-traverse';

import EvaluationElementIdError from '../../../../errors/EvaluationElementIdError.ts';

const getElementID = (element: Element): string => {
  const id = element.meta.get('id');
  // handle both raw string (new format) and StringElement (legacy Refract without __meta_raw__)
  return isElement(id) ? (toValue(id) as string) : (id as string);
};

const hasElementID = (element: Element): boolean => {
  if (!element.hasMetaProperty('id')) return false;
  const id = getElementID(element);
  return typeof id === 'string' && id !== '';
};

/**
 * Evaluates element ID against ApiDOM fragment.
 * @public
 */
export const evaluate = <T extends Element>(elementID: string, element: T): Element | undefined => {
  const { cache } = evaluate;
  // warm the cache
  if (!cache.has(element)) {
    const elementsWithID = filter(element, hasElementID);
    cache.set(element, Array.from(elementsWithID));
  }

  // search for the matching element
  const result = cache.get(element).find((e: Element) => {
    return getElementID(e) === elementID;
  });

  if (isUndefined(result)) {
    throw new EvaluationElementIdError(`Evaluation failed on element ID: "${elementID}"`);
  }

  return result;
};
evaluate.cache = new WeakMap();

export { EvaluationElementIdError };
