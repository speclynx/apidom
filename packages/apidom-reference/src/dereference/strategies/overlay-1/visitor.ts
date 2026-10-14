import { Element, ParseResultElement } from '@speclynx/apidom-datamodel';
import { toValue, toYAML } from '@speclynx/apidom-core';
import type { Path } from '@speclynx/apidom-traverse';
import type {
  Overlay1Element,
  ReusableActionReferenceElement,
} from '@speclynx/apidom-ns-overlay-1';

import { resolveReusableActionReference } from './reusable-action-reference.ts';
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
    let actionElement: Element;

    try {
      actionElement = resolveReusableActionReference(referencingElement, overlayElement);
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
