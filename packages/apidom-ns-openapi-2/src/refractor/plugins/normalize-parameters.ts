import { uniqWith } from 'ramda';
import { toValue } from '@speclynx/apidom-core';
import {
  StringElement,
  SourceMapElement,
  StyleElement,
  cloneDeep,
  isStringElement,
  isArrayElement,
} from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ParameterElement from '../../elements/Parameter.ts';
import PathItemElement from '../../elements/PathItem.ts';
import OperationElement from '../../elements/Operation.ts';
import OperationParametersElement from '../../elements/nces/OperationParameters.ts';
import type { Toolbox } from '../toolbox.ts';
import SwaggerElement from '../../elements/Swagger.ts';
import NormalizeStorage from './normalize-storage/index.ts';
import { isParameterElement } from '../../predicates.ts';

/**
 * Inheritance of Parameter Objects.
 *
 * OpenAPI 2.0 specification excerpt that defines the inheritance behavior:
 *
 * A list of parameters that are applicable for all the operations described under this path.
 * These parameters can be overridden at the operation level, but cannot be removed there.
 * The list MUST NOT include duplicated parameters.
 * A unique parameter is defined by a combination of a name and location.
 *
 * NOTE: this plugin is idempotent
 * @public
 */

export interface PluginOptions {
  storageField?: string;
}

/**
 * Establishes identity between two Parameter Objects.
 * A unique parameter is defined by a combination of a name and location.
 *
 * {@link https://spec.openapis.org/oas/v2.0.html#path-item-object}
 */
const parameterEquals = (parameter1: ParameterElement, parameter2: ParameterElement) => {
  if (!isParameterElement(parameter1)) return false;
  if (!isParameterElement(parameter2)) return false;
  if (!isStringElement(parameter1.name)) return false;
  if (!isStringElement(parameter1.in)) return false;
  if (!isStringElement(parameter2.name)) return false;
  if (!isStringElement(parameter2.in)) return false;

  return (
    toValue(parameter1.name as StringElement) === toValue(parameter2.name as StringElement) &&
    toValue(parameter1.in as StringElement) === toValue(parameter2.in as StringElement)
  );
};

/**
 * Inherits parameters from a PathItem into an Operation element.
 * Operation parameters take precedence; PathItem parameters are merged in
 * for any (name, in) combination not already defined at the Operation level.
 * @public
 */
const inheritParametersToOperation = (
  operationElement: OperationElement,
  pathItemElement: PathItemElement,
): void => {
  const pathItemParams = isArrayElement(pathItemElement.parameters)
    ? ([...pathItemElement.parameters] as ParameterElement[])
    : [];

  if (pathItemParams.length === 0) return;

  const operationParams = isArrayElement(operationElement.parameters)
    ? ([...operationElement.parameters] as ParameterElement[])
    : [];

  // prefers the first item if two items compare equal based on the predicate
  const mergedParameters = uniqWith(parameterEquals, [...operationParams, ...pathItemParams]);

  const originalParameters = operationElement.parameters;
  const mergedElement = new OperationParametersElement(mergedParameters);

  // the merged container may replace an existing source container — carry over
  // its meta, attributes, source map and style
  if (isArrayElement(originalParameters)) {
    if (!originalParameters.isMetaEmpty) {
      mergedElement.meta = originalParameters.meta.cloneDeep();
    }
    if (!originalParameters.isAttributesEmpty) {
      mergedElement.attributes = cloneDeep(originalParameters.attributes);
    }
    SourceMapElement.transfer(originalParameters, mergedElement);
    StyleElement.transfer(originalParameters, mergedElement);
  }

  operationElement.parameters = mergedElement;
};

/**
 * @public
 */
const plugin =
  ({ storageField = 'x-normalized' }: PluginOptions = {}) =>
  (toolbox: Toolbox) => {
    const { predicates } = toolbox;

    let storage: NormalizeStorage | undefined;

    return {
      visitor: {
        SwaggerElement: {
          enter(path: Path<SwaggerElement>) {
            const element = path.node;
            storage = new NormalizeStorage(element, storageField, 'parameters');
          },
          leave() {
            storage = undefined;
          },
        },
        OperationElement: {
          leave(path: Path<OperationElement>) {
            const operationElement = path.node;
            const ancestors = path.getAncestorNodes(); // parent to root order

            // skip visiting this Operation if inside parameters definitions
            if (ancestors.some(predicates.isParametersDefinitionsElement)) {
              return;
            }

            const parentPathItemElement = ancestors.find(predicates.isPathItemElement);

            // no parent Path Item to inherit from
            if (!predicates.isPathItemElement(parentPathItemElement)) {
              return;
            }

            const operationJSONPointer = path.formatPath();

            // skip visiting this Operation Object if it's already normalized
            if (storage!.includes(operationJSONPointer)) {
              return;
            }

            inheritParametersToOperation(
              operationElement,
              parentPathItemElement as unknown as PathItemElement,
            );
            storage!.append(operationJSONPointer);
          },
        },
      },
    };
  };

plugin.inheritParametersToOperation = inheritParametersToOperation;

export default plugin;
