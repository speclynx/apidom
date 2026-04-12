import {
  isStringElement,
  isBooleanElement,
  isObjectElement,
  isArrayElement,
} from '@speclynx/apidom-datamodel';
import { isActionElement, type ActionElement } from '@speclynx/apidom-ns-overlay-1';

import OverlayError from './errors/OverlayError.ts';

/**
 * @public
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly error?: OverlayError;
}

const valid: ValidationResult = { valid: true };

const invalid = (error: OverlayError): ValidationResult => ({ valid: false, error });

/**
 * Validates that an ActionElement has the correct shape per the Overlay spec.
 *
 * @public
 */
export const validateAction = (actionElement: ActionElement): ValidationResult => {
  if (!isActionElement(actionElement)) {
    return invalid(new OverlayError('Action must be an ActionElement', { action: actionElement }));
  }

  if (!isStringElement(actionElement.target)) {
    return invalid(
      new OverlayError('Action "target" field is required and must be a string', {
        action: actionElement,
        member: actionElement.getMember('target'),
      }),
    );
  }

  if (actionElement.update !== undefined && actionElement.copy !== undefined) {
    return invalid(
      new OverlayError('Action must not have both "update" and "copy" fields', {
        action: actionElement,
      }),
    );
  }

  if (actionElement.copy !== undefined && !isStringElement(actionElement.copy)) {
    return invalid(
      new OverlayError('Action "copy" field must be a string (JSONPath expression)', {
        action: actionElement,
        member: actionElement.getMember('copy'),
      }),
    );
  }

  if (actionElement.removeField !== undefined && !isBooleanElement(actionElement.removeField)) {
    return invalid(
      new OverlayError('Action "remove" field must be a boolean', {
        action: actionElement,
        member: actionElement.getMember('remove'),
      }),
    );
  }

  return valid;
};

type NodeCategory = 'object' | 'array' | 'primitive';

const categorizeNode = (node: unknown): NodeCategory => {
  if (isObjectElement(node)) return 'object';
  if (isArrayElement(node)) return 'array';
  return 'primitive';
};

/**
 * Validates that all matched target nodes are the same type
 * when there are 2 or more matches (spec requirement for update/copy).
 *
 * @public
 */
export const validateTargetNodes = (nodes: unknown[]): ValidationResult => {
  if (nodes.length < 2) return valid;

  const firstCategory = categorizeNode(nodes[0]);
  for (let i = 1; i < nodes.length; i++) {
    const category = categorizeNode(nodes[i]);
    if (category !== firstCategory) {
      return invalid(
        new OverlayError(
          `All target nodes must be the same type when selecting multiple nodes. ` +
            `Expected "${firstCategory}" but found "${category}" at index ${i}`,
        ),
      );
    }
  }

  return valid;
};
