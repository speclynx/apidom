import { cloneDeep } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';

import ActionElement from './elements/Action.ts';
import Overlay1Element from './elements/Overlay1.ts';
import ReusableActionReferenceElement from './elements/ReusableActionReference.ts';
import { isActionElement, isReusableActionElement } from './predicates.ts';

const REF_PREFIX = '#/components/actions/';

const decodeComponentKey = ($ref: string): string => {
  if (!$ref.startsWith(REF_PREFIX)) {
    throw new ApiDOMStructuredError(
      `Reusable Action Reference "${$ref}" must point to "${REF_PREFIX}<name>"`,
      { $ref },
    );
  }

  let token: string;
  try {
    token = decodeURIComponent($ref.slice(REF_PREFIX.length));
  } catch {
    throw new ApiDOMStructuredError(
      `Reusable Action Reference "${$ref}" is not a valid URI fragment`,
      { $ref },
    );
  }

  // a single JSON Pointer token: "/" must be "~1" and "~" must be "~0" (RFC 6901 §3)
  if (token === '' || token.includes('/') || /~(?![01])/.test(token)) {
    throw new ApiDOMStructuredError(
      `Reusable Action Reference "${$ref}" must contain a single escaped component name`,
      { $ref },
    );
  }

  return token.replaceAll('~1', '/').replaceAll('~0', '~');
};

/**
 * Resolves a Reusable Action Reference Object against `components.actions`
 * of the Overlay document and returns an equivalent Action Object.
 *
 * The returned action carries the reference's `target`, the reusable action's
 * `fields`, and the reference's `description` when present (it takes precedence
 * over the one in `fields`). All values are deep clones.
 *
 * @throws ApiDOMStructuredError when the reference is malformed or cannot be resolved
 * @public
 */
export const resolveReusableActionReference = (
  referenceElement: ReusableActionReferenceElement,
  overlayElement: Overlay1Element,
): ActionElement => {
  const $ref = toValue(referenceElement.$ref);

  if (typeof $ref !== 'string') {
    throw new ApiDOMStructuredError('Reusable Action Reference "$ref" field must be a string');
  }

  const key = decodeComponentKey($ref);
  const reusableAction = overlayElement.components?.actions?.get(key);

  if (!isReusableActionElement(reusableAction)) {
    throw new ApiDOMStructuredError(`Reusable Action Reference "${$ref}" cannot be resolved`, {
      $ref,
    });
  }

  const { fields } = reusableAction;

  if (isActionElement(fields) && fields.hasKey('target')) {
    throw new ApiDOMStructuredError(
      `Reusable Action "${key}" must not define "target" in its "fields"`,
      { $ref },
    );
  }

  const actionElement = new ActionElement();

  const { target, description } = referenceElement;

  if (target !== undefined) {
    actionElement.set('target', cloneDeep(target));
  }
  if (isActionElement(fields)) {
    fields.forEach((value, keyElement) => {
      actionElement.set(toValue(keyElement) as string, cloneDeep(value));
    });
  }
  if (description !== undefined) {
    actionElement.set('description', cloneDeep(description));
  }

  return actionElement;
};
