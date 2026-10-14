import { Element, ParseResultElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { toValue, toYAML } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import {
  evaluate as jsonPointerEvaluate,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import type { Path } from '@speclynx/apidom-traverse';
import {
  ActionElement,
  isActionElement,
  isReusableActionElement,
  type Overlay1Element,
  type ReusableActionReferenceElement,
} from '@speclynx/apidom-ns-overlay-1';

import UnresolvableReferenceError from '../../../errors/UnresolvableReferenceError.ts';
import Reference from '../../../Reference.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * @public
 */
export interface Overlay1DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
}

/**
 * @public
 */
class Overlay1DereferenceVisitor {
  protected readonly reference: Reference;

  protected readonly options: ReferenceOptions;

  constructor({ reference, options }: Overlay1DereferenceVisitorOptions) {
    this.reference = reference;
    this.options = options;
  }

  public ReusableActionReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as ReusableActionReferenceElement;

    // ignore if resolve.internal is false (Reusable Action References are internal references only)
    if (!this.options.resolve.internal) {
      path.skip();
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;
    const overlayElement = (this.reference.value as ParseResultElement).result as Overlay1Element;
    const actionElement = new ActionElement();

    try {
      if (typeof $ref !== 'string') {
        throw new ApiDOMStructuredError('Reusable Action Reference "$ref" field must be a string');
      }

      // only `target`, `description` and extensions may accompany `$ref`
      const disallowedField = ['update', 'copy', 'remove'].find((field) =>
        referencingElement.hasKey(field),
      );
      if (disallowedField !== undefined) {
        throw new ApiDOMStructuredError(
          `Reusable Action Reference "${$ref}" must not define "${disallowedField}"`,
          { $ref },
        );
      }

      // same-document reference only; external references are not supported
      if (!$ref.startsWith('#')) {
        throw new ApiDOMStructuredError(
          `Reusable Action Reference "${$ref}" must be a same-document reference`,
          { $ref },
        );
      }

      /**
       * Only entries of `components.actions` are refracted as Reusable Actions,
       * so the element type alone proves the pointer leads there.
       */
      let reusableAction: Element | undefined;
      try {
        reusableAction = jsonPointerEvaluate<Element>(
          overlayElement,
          URIFragmentIdentifier.from($ref),
        );
      } catch {
        reusableAction = undefined;
      }

      if (!isReusableActionElement(reusableAction)) {
        throw new ApiDOMStructuredError(`Reusable Action Reference "${$ref}" cannot be resolved`, {
          $ref,
        });
      }

      const { fields } = reusableAction;

      if (fields !== undefined && !isActionElement(fields)) {
        throw new ApiDOMStructuredError(
          `Reusable Action "${$ref}" must define "fields" as an object`,
          {
            $ref,
          },
        );
      }

      if (isActionElement(fields) && fields.hasKey('target')) {
        throw new ApiDOMStructuredError(
          `Reusable Action "${$ref}" must not define "target" in its "fields"`,
          { $ref },
        );
      }

      // the reference supplies `target` and its `description` takes precedence over the one in `fields`
      const { target, description } = referencingElement;

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
    } catch (error: unknown) {
      const { continueOnError } = this.options.dereference;
      const unresolvedError = new UnresolvableReferenceError(
        `Error while dereferencing Reusable Action Reference "${$ref}": ${(error as Error).message}`,
        {
          cause: error,
          type: referencingElement.element,
          uri: this.reference.uri,
          location: path.formatPath(),
          codeFrame: toYAML(referencingElement),
          refFieldName: '$ref',
          refFieldValue: $ref,
          trace: [],
        },
      );

      if (continueOnError === false) throw unresolvedError;
      if (typeof continueOnError === 'function') continueOnError(unresolvedError);
      path.skip();
      return;
    }

    // annotate with info about original referencing element
    actionElement.meta.set('ref-fields', {
      $ref,
      description: toValue(referencingElement.description),
    });
    // annotate with info about origin
    actionElement.meta.set('ref-origin', this.reference.uri);
    actionElement.meta.set('ref-type', referencingElement.element);

    /**
     * Transclude referencing element with resolved Action Object.
     */
    path.replaceWith(actionElement);
    path.skip();
  }
}

export default Overlay1DereferenceVisitor;
