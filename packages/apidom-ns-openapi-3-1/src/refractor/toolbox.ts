import {
  Element,
  Namespace,
  ArrayElement,
  isStringElement,
  isArrayElement,
  isObjectElement,
  isMemberElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { compile as compileJSONPointerTokens } from '@speclynx/apidom-json-pointer';

import * as openApi3_1Predicates from '../predicates.ts';
import * as refractorPredicates from './predicates.ts';
import openApi3_1Namespace from '../namespace.ts';

/**
 * @public
 */
export interface Toolbox {
  predicates: Record<string, (...args: any[]) => boolean>;
  ancestorLineageToJSONPointer: typeof ancestorLineageToJSONPointer;
  namespace: Namespace;
}

/**
 * Translates visitor ancestor lineage to a JSON Pointer tokens.
 * Ancestor lineage is constructed of following visitor method arguments:
 *
 *  - ancestors
 *  - parent
 *  - element
 * @public
 */
export const ancestorLineageToJSONPointer = <T extends (Element | Element[])[]>(elementPath: T) => {
  const jsonPointerTokens = elementPath.reduce((path, element, index) => {
    if (isMemberElement(element)) {
      const token = String(toValue(element.key));
      path.push(token);
    } else if (isArrayElement(elementPath[index - 2])) {
      const arrayElement = elementPath[index - 2] as ArrayElement;
      const token = String((arrayElement.content as Element[])?.indexOf(element as Element) ?? -1);
      path.push(token);
    }

    return path;
  }, [] as string[]);

  return compileJSONPointerTokens(jsonPointerTokens);
};

/**
 * @public
 */
const createToolbox = (): Toolbox => {
  const namespace = new Namespace();
  const predicates = {
    ...refractorPredicates,
    ...openApi3_1Predicates,
    isStringElement,
    isArrayElement,
    isObjectElement,
  };

  namespace.use(openApi3_1Namespace);

  return { predicates, ancestorLineageToJSONPointer, namespace };
};

export default createToolbox;
