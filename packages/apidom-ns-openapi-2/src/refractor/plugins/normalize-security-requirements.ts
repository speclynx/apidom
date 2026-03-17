import { ArrayElement, isArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SwaggerElement from '../../elements/Swagger.ts';
import OperationElement from '../../elements/Operation.ts';
import OperationSecurityElement from '../../elements/nces/OperationSecurity.ts';
import type { Toolbox } from '../toolbox.ts';
import NormalizeStorage from './normalize-storage/index.ts';

/**
 * Override of Security Requirement Objects.
 *
 * OpenAPI 2.0 specification excerpt that defines the override behavior:
 *
 * Operation.security definition overrides any declared top-level security.
 * To remove a top-level security declaration, an empty array can be used.
 *
 * NOTE: this plugin is idempotent
 * @public
 */

export interface PluginOptions {
  storageField?: string;
}

/**
 * Inherits top-level security requirements into an Operation element.
 * If Operation.security is missing and Swagger.security is defined, copies it down.
 * @public
 */
const inheritSecurityToOperation = (
  operationElement: OperationElement,
  swaggerElement: SwaggerElement,
): void => {
  const missingOperationLevelSecurity = typeof operationElement.security === 'undefined';
  const hasTopLevelSecurity = isArrayElement(swaggerElement.security);

  if (missingOperationLevelSecurity && hasTopLevelSecurity) {
    operationElement.security = new OperationSecurityElement([...swaggerElement.security!]);
  }
};

/**
 * @public
 */
const plugin =
  ({ storageField = 'x-normalized' }: PluginOptions = {}) =>
  (toolbox: Toolbox) => {
    const { predicates } = toolbox;
    let topLevelSecurity: ArrayElement | undefined;
    let storage: NormalizeStorage | undefined;

    return {
      visitor: {
        SwaggerElement: {
          enter(path: Path<SwaggerElement>) {
            const swaggerElement = path.node;
            storage = new NormalizeStorage(swaggerElement, storageField, 'security-requirements');
            if (predicates.isArrayElement(swaggerElement.security)) {
              topLevelSecurity = swaggerElement.security;
            }
          },
          leave() {
            storage = undefined;
            topLevelSecurity = undefined;
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

            const operationJSONPointer = path.formatPath();

            // skip visiting this Operation Object if it's already normalized
            if (storage!.includes(operationJSONPointer)) {
              return;
            }

            const missingOperationLevelSecurity = typeof operationElement.security === 'undefined';
            const hasTopLevelSecurity = typeof topLevelSecurity !== 'undefined';

            if (missingOperationLevelSecurity && hasTopLevelSecurity) {
              operationElement.security = new OperationSecurityElement([...topLevelSecurity!]);
              storage!.append(operationJSONPointer);
            }
          },
        },
      },
    };
  };

plugin.inheritSecurityToOperation = inheritSecurityToOperation;

export default plugin;
