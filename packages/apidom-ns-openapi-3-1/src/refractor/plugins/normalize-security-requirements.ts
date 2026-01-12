import { ArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { OperationSecurityElement } from '@speclynx/apidom-ns-openapi-3-0';

import OpenApi3_1Element from '../../elements/OpenApi3-1.ts';
import OperationElement from '../../elements/Operation.ts';
import type { Toolbox } from '../toolbox.ts';
import NormalizeStorage from './normalize-header-examples/NormalizeStorage.ts';
/**
 * Override of Security Requirement Objects.
 *
 * OpenAPI 3.1 specification excerpt that defines the override behavior:
 *
 * Operation.security definition overrides any declared top-level security.
 * To remove a top-level security declaration, an empty array can be used.
 * When a list of Security Requirement Objects is defined on the OpenAPI Object or Operation Object,
 * only one of the Security Requirement Objects in the list needs to be satisfied to authorize the request.
 *
 * NOTE: this plugin is idempotent
 * @public
 */

export interface PluginOptions {
  storageField?: string;
}

/**
 * @public
 */
const plugin =
  ({ storageField = 'x-normalized' }: PluginOptions = {}) =>
  (toolbox: Toolbox) => {
    const { predicates, ancestorLineageToJSONPointer } = toolbox;
    let topLevelSecurity: ArrayElement | undefined;
    let storage: NormalizeStorage | undefined;

    return {
      visitor: {
        OpenApi3_1Element: {
          enter(path: Path<OpenApi3_1Element>) {
            const openapiElement = path.node;
            storage = new NormalizeStorage(openapiElement, storageField, 'security-requirements');
            if (predicates.isArrayElement(openapiElement.security)) {
              topLevelSecurity = openapiElement.security;
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
            const ancestors = path.getAncestorNodes().reverse(); // root to parent order

            // skip visiting this Operation
            if (ancestors.some(predicates.isComponentsElement)) {
              return;
            }

            const operationJSONPointer = ancestorLineageToJSONPointer([
              ...ancestors,
              operationElement,
            ]);

            // skip visiting this Operation Object if it's already normalized
            if (storage!.includes(operationJSONPointer)) {
              return;
            }

            const missingOperationLevelSecurity = typeof operationElement.security === 'undefined';
            const hasTopLevelSecurity = typeof topLevelSecurity !== 'undefined';

            if (missingOperationLevelSecurity && hasTopLevelSecurity) {
              operationElement.security = new OperationSecurityElement(
                (topLevelSecurity?.content as unknown[] | undefined) ?? undefined,
              );
              storage!.append(operationJSONPointer);
            }
          },
        },
      },
    };
  };

export default plugin;
