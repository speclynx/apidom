import { ParseResultElement, isArrayElement } from '@speclynx/apidom-datamodel';
import {
  isOverlay1Element,
  isReusableActionReferenceElement,
  resolveReusableActionReference,
} from '@speclynx/apidom-ns-overlay-1';
import { toValue, toYAML } from '@speclynx/apidom-core';

import type { ReferenceOptions } from '../../../options/index.ts';
import UnresolvableReferenceError from '../../../errors/UnresolvableReferenceError.ts';

/**
 * Replaces Reusable Action References (Overlay 1.2.0) in the `actions` field
 * with the Action Objects they resolve to.
 *
 * Reusable Action References are same-document references, so only the overlay
 * document itself is consulted. Each resolved action is annotated with
 * `ref-fields`, `ref-origin` and `ref-type` meta. References that cannot be
 * resolved are reported according to `dereference.continueOnError` and are left in place.
 *
 * @param parseResult - ParseResult containing an Overlay specification
 * @param uri - URI of the Overlay document
 * @param options - Full ReferenceOptions
 *
 * @public
 */
export function dereferenceReusableActions(
  parseResult: ParseResultElement,
  uri: string,
  options: ReferenceOptions,
): void {
  const { api } = parseResult;

  if (!isOverlay1Element(api) || !isArrayElement(api.actions)) {
    return;
  }

  const { actions } = api;
  const { continueOnError } = options.dereference;

  actions.forEach((item, index) => {
    if (!isReusableActionReferenceElement(item)) return;

    const $ref = toValue(item.$ref) as string;

    try {
      const actionElement = resolveReusableActionReference(item, api);

      actionElement.meta.set('ref-fields', {
        $ref,
        description: toValue(item.description),
      });
      actionElement.meta.set('ref-origin', uri);
      actionElement.meta.set('ref-type', item.element);

      actions.set(index, actionElement);
    } catch (error: unknown) {
      const unresolvedError = new UnresolvableReferenceError(
        `Error while dereferencing Reusable Action Reference "${$ref}": ${(error as Error).message}`,
        {
          cause: error,
          type: item.element,
          uri,
          location: `/actions/${index}`,
          codeFrame: toYAML(item),
          refFieldName: '$ref',
          refFieldValue: $ref,
          trace: [],
        },
      );

      if (continueOnError === false) throw unresolvedError;
      if (typeof continueOnError === 'function') continueOnError(unresolvedError);
    }
  });
}
