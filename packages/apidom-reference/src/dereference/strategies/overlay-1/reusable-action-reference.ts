import { cloneDeep } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { parse, URIFragmentIdentifier } from '@speclynx/apidom-json-pointer';
import {
  ActionElement,
  isActionElement,
  isReusableActionElement,
  type Overlay1Element,
  type ReusableActionReferenceElement,
} from '@speclynx/apidom-ns-overlay-1';

const decodeComponentKey = ($ref: string): string => {
  // same-document reference whose JSON Pointer is /components/actions/<name> (RFC 6901 §6)
  const { result, tree } = $ref.startsWith('#')
    ? parse(URIFragmentIdentifier.from($ref))
    : { result: { success: false }, tree: undefined };

  if (
    !result.success ||
    tree === undefined ||
    tree.length !== 3 ||
    tree[0] !== 'components' ||
    tree[1] !== 'actions' ||
    tree[2] === ''
  ) {
    throw new ApiDOMStructuredError(
      `Reusable Action Reference "${$ref}" must point to "#/components/actions/<name>"`,
      { $ref },
    );
  }

  return tree[2];
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

  // only `target`, `description` and extensions may accompany `$ref`
  const disallowedField = ['update', 'copy', 'remove'].find((field) =>
    referenceElement.hasKey(field),
  );
  if (disallowedField !== undefined) {
    throw new ApiDOMStructuredError(
      `Reusable Action Reference "${$ref}" must not define "${disallowedField}"`,
      { $ref },
    );
  }

  const key = decodeComponentKey($ref);
  const reusableAction = overlayElement.components?.actions?.get(key);

  if (!isReusableActionElement(reusableAction)) {
    throw new ApiDOMStructuredError(`Reusable Action Reference "${$ref}" cannot be resolved`, {
      $ref,
    });
  }

  const { fields } = reusableAction;

  if (fields !== undefined && !isActionElement(fields)) {
    throw new ApiDOMStructuredError(`Reusable Action "${key}" must define "fields" as an object`, {
      $ref,
    });
  }

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
