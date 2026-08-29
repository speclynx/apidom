import { propEq, none } from 'ramda';
import {
  isElement,
  isStringElement,
  Element,
  RefElement,
  BooleanElement,
  ParseResultElement,
  cloneShallow,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue, toYAML } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { traverse, traverseAsync, type Path } from '@speclynx/apidom-traverse';
import {
  evaluate as jsonPointerEvaluate,
  compile as jsonPointerCompile,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  ArazzoSpecification1Element,
  ReusableElement,
  JSONSchemaElement,
  isParameterElement,
  isJSONSchemaElement,
  isBooleanJSONSchemaElement,
} from '@speclynx/apidom-ns-arazzo-1';
import { parse as parseRuntimeExpression } from '@swaggerexpert/arazzo-runtime-expression';

import { isAnchor, uriToAnchor, evaluate as $anchorEvaluate } from './selectors/$anchor.ts';
import { evaluate as uriEvaluate } from './selectors/uri.ts';
import { resolveSchema$refField } from '../openapi-3-1/util.ts';
import {
  maybeRefractToJSONSchemaElement,
  resolveArazzo$selfField,
  identifiedBy$self,
} from './util.ts';
import UnresolvableReferenceError from '../../../errors/UnresolvableReferenceError.ts';
import MaximumDereferenceDepthError from '../../../errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import File from '../../../File.ts';
import Resolver from '../../../resolve/resolvers/Resolver.ts';
import { AncestorLineage } from '../../util.ts';
import EvaluationJsonSchemaUriError from '../../../errors/EvaluationJsonSchemaUriError.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * @public
 */
export interface Arazzo1DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly indirections?: Element[];
  readonly ancestors?: AncestorLineage<Element>;
  readonly visited?: WeakSet<Element>;
}

/**
 * @public
 */
class Arazzo1DereferenceVisitor {
  protected readonly indirections: Element[];

  protected readonly reference: Reference;

  /**
   * Base URI of the current document for resolving relative references.
   * Honors the Arazzo `$self` field when present, otherwise falls back
   * to the retrieval URI (`this.reference.uri`).
   */
  protected readonly baseURI: string;

  protected readonly options: ReferenceOptions;

  protected readonly visited: WeakSet<Element>;

  /**
   * Tracks element ancestors across dive-deep traversal boundaries.
   * Used for cycle detection: if a referenced element is found in
   * the ancestor lineage, a circular reference is detected.
   */
  protected readonly ancestors: AncestorLineage<Element>;

  constructor({
    reference,
    options,
    indirections = [],
    ancestors = new AncestorLineage(),
    visited = new WeakSet(),
  }: Arazzo1DereferenceVisitorOptions) {
    this.indirections = indirections;
    this.reference = reference;
    this.baseURI = resolveArazzo$selfField(
      reference.uri,
      (reference.value as ParseResultElement | undefined)?.result,
    );
    this.options = options;
    this.ancestors = new AncestorLineage(...ancestors);
    this.visited = visited;
  }

  protected toAncestorLineage(path: Path<Element>): [AncestorLineage<Element>, Set<Element>] {
    const ancestorNodes = path.getAncestorNodes();
    const directAncestors = new Set<Element>(ancestorNodes.filter(isElement));
    const ancestorsLineage = new AncestorLineage(...this.ancestors, directAncestors);
    return [ancestorsLineage, directAncestors];
  }

  protected toBaseURI(uri: string): string {
    return url.resolve(this.baseURI, url.sanitize(url.stripHash(uri)));
  }

  protected async toReference(uri: string): Promise<Reference> {
    // detect maximum depth of resolution
    if (this.reference.depth >= this.options.resolve.maxDepth) {
      throw new MaximumResolveDepthError(
        `Maximum resolution depth of ${this.options.resolve.maxDepth} has been exceeded by file "${this.reference.uri}"`,
        { maxDepth: this.options.resolve.maxDepth, uri: this.reference.uri },
      );
    }

    const baseURI = this.toBaseURI(uri);
    const { refSet } = this.reference as { refSet: ReferenceSet };

    // we've already processed this Reference in past
    if (refSet.has(baseURI)) {
      return refSet.find(propEq(baseURI, 'uri'))!;
    }

    // identity-based referencing: URI matches `$self` of an already processed Arazzo document
    const referenceBy$self = refSet.find(identifiedBy$self(baseURI));
    if (referenceBy$self !== undefined) {
      return referenceBy$self;
    }

    const parseResult = await parse(url.unsanitize(baseURI), {
      ...this.options,
      parse: { ...this.options.parse, mediaType: 'text/plain' },
    });

    // register new mutable reference with a refSet
    //
    // NOTE(known limitation): the mutable reference is mutated in place during traversal
    // (via `{ mutable: true }`). When an external document evaluates a JSON pointer back
    // into this document, it may receive an already-resolved element instead of the original
    // $ref. That resolved element was produced using the entry document's resolution context
    // (ancestors, indirections), which may differ from the external document's context.
    // This can affect cycle detection in rare cross-document circular reference patterns.
    //
    // Remediation: evaluate JSON pointers against the immutable (original) parse tree
    // instead of the mutable working copy. The `immutable://` reference below preserves
    // the original tree and could be used for pointer evaluation, ensuring every resolution
    // context always sees raw, unresolved elements and processes them with its own
    // ancestors/indirections. The trade-off is that elements referenced by multiple
    // documents would be resolved once per context instead of being reused.
    const mutableReference = new Reference({
      uri: baseURI,
      value: this.options.dereference.immutable ? cloneDeep(parseResult) : parseResult,
      depth: this.reference.depth + 1,
    });
    refSet.add(mutableReference);

    if (this.options.dereference.immutable) {
      // register new immutable reference with a refSet
      const immutableReference = new Reference({
        uri: `immutable://${baseURI}`,
        value: parseResult,
        depth: this.reference.depth + 1,
      });
      refSet.add(immutableReference);
    }

    return mutableReference;
  }

  /**
   * Handles an error according to the continueOnError option.
   *
   * For new errors: wraps in UnresolvableReferenceError with structured context
   * (type, uri, location, codeFrame, refFieldName, refFieldValue, trace).
   * For errors already wrapped by a nested visitor: prepends the current hop to the trace.
   *
   * Inner/intermediate visitors always throw to let the trace accumulate.
   * Only the entry document visitor respects continueOnError (callback/swallow/throw).
   */
  protected handleError(
    message: string,
    error: Error,
    referencingElement: Element,
    refFieldName: string,
    refFieldValue: string,
    visitorPath: Path<Element>,
  ): void {
    const { continueOnError } = this.options.dereference;
    const isEntryDocument =
      url.stripHash(this.reference.refSet?.rootRef?.uri ?? '') === this.reference.uri;
    const uri = this.reference.uri;
    const type = referencingElement.element as string;
    const codeFrame = toYAML(referencingElement);

    // find element location by identity in the document tree.
    // guarded: this.reference.value may not be a ParseResultElement or may lack a result.
    // falls back to visitorPath which may produce an incomplete path when
    // dereferenceApiDOM is called with a fragment (cloneShallow creates a new root identity).
    let location: string | undefined;
    const root = (this.reference.value as ParseResultElement).result;
    if (isElement(root)) {
      traverse(root, {
        enter(p: Path<Element>) {
          if (p.node === referencingElement) {
            location = p.formatPath();
            p.stop();
          }
        },
      });
    }
    location ??= visitorPath.formatPath();

    const hop = { uri, type, refFieldName, refFieldValue, location, codeFrame };

    // enrich existing error from nested visitor or create new one
    let unresolvedError: UnresolvableReferenceError;
    if (error instanceof UnresolvableReferenceError) {
      // prefix relative locations for entries belonging to the referenced document
      const refBaseURI = this.toBaseURI(refFieldValue);
      const fragment = URIFragmentIdentifier.fromURIReference(refFieldValue);
      if (fragment) {
        if (refBaseURI === (error as any).uri && (error as any).location) {
          (error as any).location = fragment + (error as any).location;
        }
        for (const h of (error as any).trace) {
          if (h.uri === refBaseURI && h.location) h.location = fragment + h.location;
        }
      }
      // @ts-ignore
      error.trace = [hop, ...error.trace];
      unresolvedError = error;
    } else {
      unresolvedError = new UnresolvableReferenceError(message, {
        cause: error,
        type,
        uri,
        location,
        codeFrame,
        refFieldName,
        refFieldValue,
        trace: [],
      });
    }

    if (!isEntryDocument || continueOnError === false) throw unresolvedError;
    if (typeof continueOnError === 'function') continueOnError(unresolvedError);
  }

  public ReusableElement(path: Path<Element>) {
    const referencingElement = path.node as ReusableElement;

    // skip current Reusable Object if reference field is not defined as a string
    if (!isStringElement(referencingElement.reference)) {
      path.skip();
      return;
    }

    // ignore if resolve.internal is false (Reusable Objects are internal references only)
    if (!this.options.resolve.internal) {
      path.skip();
      return;
    }
    const runtimeExpression = toValue(referencingElement.reference) as string;

    // parse the runtime expression
    const { result, tree } = parseRuntimeExpression(runtimeExpression);

    if (!result.success) {
      throw new ApiDOMStructuredError(
        `Invalid Reusable Object reference format: "${runtimeExpression}"`,
        { runtimeExpression },
      );
    }

    // ReusableElement can only reference components
    if (tree.type !== 'ComponentsExpression') {
      throw new ApiDOMStructuredError(
        `Reusable Object reference "${runtimeExpression}" must be a components expression`,
        { runtimeExpression },
      );
    }

    // evaluate runtime expression as JSON Pointer to get the referenced element
    const jsonPointer = jsonPointerCompile(['components', tree.componentType, tree.componentName]);
    let referencedElement: Element;
    try {
      referencedElement = jsonPointerEvaluate<Element>(
        (this.reference.value as ParseResultElement).result as ArazzoSpecification1Element,
        jsonPointer,
      );
    } catch {
      throw new ApiDOMStructuredError(
        `Reusable Object reference "${runtimeExpression}" cannot be resolved`,
        { runtimeExpression },
      );
    }

    /**
     * Create a shallow clone of the referenced element to avoid modifying the original.
     */
    const mergedElement = cloneShallow(referencedElement);
    // annotate with info about original referencing element
    mergedElement.meta.set('ref-fields', {
      reference: runtimeExpression,
      value: toValue(referencingElement.value),
    });
    // annotate with info about origin
    mergedElement.meta.set('ref-origin', this.reference.uri);
    mergedElement.meta.set('ref-type', referencingElement.element);

    // override value field if present for Parameter Objects
    if (isParameterElement(mergedElement) && referencingElement.hasKey('value')) {
      mergedElement.remove('value');
      mergedElement.set('value', referencingElement.get('value'));
    }

    /**
     * Transclude referencing element with merged referenced element.
     */
    path.replaceWith(mergedElement);
    path.skip();
  }

  public async JSONSchemaElement(path: Path<Element>) {
    const referencingElement = path.node as JSONSchemaElement;

    // skip current referencing schema as $ref keyword was not defined
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    // skip current referencing element as it's already been accessed
    if (this.indirections.includes(referencingElement)) {
      path.skip();
      return;
    }

    const indirectionsSize = this.indirections.length;

    try {
      // compute baseURI using rules around $self, $id and $ref keywords
      let reference = await this.toReference(url.unsanitize(this.reference.uri));
      let { uri: retrievalURI } = reference;
      const $refBaseURI = resolveSchema$refField(this.baseURI, referencingElement)!;
      const $refBaseURIStrippedHash = url.stripHash($refBaseURI);
      const file = new File({ uri: $refBaseURIStrippedHash });
      const isUnknownURI = none((r: Resolver) => r.canRead(file), this.options.resolve.resolvers);
      const isURL = !isUnknownURI;
      let isInternalReference = this.baseURI === $refBaseURI;
      let isExternalReference = !isInternalReference;

      // determining reference, proper evaluation and selection mechanism
      let referencedElement: Element;

      try {
        if (isUnknownURI || isURL) {
          // we're dealing with canonical URI or URL with possible fragment
          retrievalURI = this.toBaseURI($refBaseURI);
          const selector = $refBaseURI;
          const referenceAsSchema = maybeRefractToJSONSchemaElement(
            (reference.value as ParseResultElement).result as Element,
          );
          referencedElement = uriEvaluate(selector, referenceAsSchema)!;
          referencedElement = maybeRefractToJSONSchemaElement(referencedElement);

          // ignore resolving internal Schema Objects
          if (!this.options.resolve.internal && isInternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }
          // ignore resolving external Schema Objects
          if (!this.options.resolve.external && isExternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }
        } else {
          // we're assuming here that we're dealing with JSON Pointer here
          retrievalURI = this.toBaseURI($refBaseURI);
          isInternalReference = this.baseURI === retrievalURI;
          isExternalReference = !isInternalReference;

          // ignore resolving internal Schema Objects
          if (!this.options.resolve.internal && isInternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }
          // ignore resolving external Schema Objects
          if (!this.options.resolve.external && isExternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }

          reference = await this.toReference(url.unsanitize($refBaseURI));
          const selector = URIFragmentIdentifier.fromURIReference($refBaseURI);
          const referenceAsSchema = maybeRefractToJSONSchemaElement(
            (reference.value as ParseResultElement).result as Element,
          );
          referencedElement = jsonPointerEvaluate(referenceAsSchema, selector);
          referencedElement = maybeRefractToJSONSchemaElement(referencedElement);
        }
      } catch (error) {
        /**
         * JSONSchemaElement($id=URL) was not found, so we're going to try to resolve
         * the URL and assume the returned response is a JSON Schema.
         */
        if (isURL && error instanceof EvaluationJsonSchemaUriError) {
          if (isAnchor(uriToAnchor($refBaseURI))) {
            // we're dealing with JSON Schema $anchor here
            isInternalReference = this.baseURI === retrievalURI;
            isExternalReference = !isInternalReference;

            // ignore resolving internal Schema Objects
            if (!this.options.resolve.internal && isInternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }
            // ignore resolving external Schema Objects
            if (!this.options.resolve.external && isExternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }

            reference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = uriToAnchor($refBaseURI);
            const referenceAsSchema = maybeRefractToJSONSchemaElement(
              (reference.value as ParseResultElement).result as Element,
            );
            referencedElement = $anchorEvaluate(selector, referenceAsSchema)!;
            referencedElement = maybeRefractToJSONSchemaElement(referencedElement);
          } else {
            // we're assuming here that we're dealing with JSON Pointer here
            retrievalURI = this.toBaseURI($refBaseURI);
            isInternalReference = this.baseURI === retrievalURI;
            isExternalReference = !isInternalReference;

            // ignore resolving internal Schema Objects
            if (!this.options.resolve.internal && isInternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }
            // ignore resolving external Schema Objects
            if (!this.options.resolve.external && isExternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }

            reference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = URIFragmentIdentifier.fromURIReference($refBaseURI);
            const referenceAsSchema = maybeRefractToJSONSchemaElement(
              (reference.value as ParseResultElement).result as Element,
            );
            referencedElement = jsonPointerEvaluate(referenceAsSchema, selector);
            referencedElement = maybeRefractToJSONSchemaElement(referencedElement);
          }
        } else {
          throw error;
        }
      }

      this.indirections.push(referencingElement);

      // detect direct or indirect reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive JSON Schema reference detected', {
          $ref: toValue(referencingElement.$ref),
        });
      }

      // detect maximum depth of dereferencing
      if (this.indirections.length > this.options.dereference.maxDepth) {
        throw new MaximumDereferenceDepthError(
          `Maximum dereference depth of "${this.options.dereference.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
          { maxDepth: this.options.dereference.maxDepth, uri: this.reference.uri },
        );
      }

      // detect cross-boundary cycle
      const [ancestorsLineage, directAncestors] = this.toAncestorLineage(path);
      if (ancestorsLineage.includes(referencedElement)) {
        reference.refSet!.circular = true;

        if (this.options.dereference.circular === 'error') {
          throw new ApiDOMStructuredError('Circular reference detected', {
            $ref: toValue(referencingElement.$ref),
          });
        } else if (this.options.dereference.circular === 'replace') {
          const refElement = new RefElement($refBaseURI, {
            type: referencingElement.element,
            uri: reference.uri,
            $ref: toValue(referencingElement.$ref),
          });
          const replacer =
            this.options.dereference.strategyOpts['arazzo-1']?.circularReplacer ??
            this.options.dereference.circularReplacer;
          const replacement = replacer(refElement);

          path.replaceWith(replacement);
          path.skip();
          return;
        }
      }

      /**
       * Dive deep into the fragment.
       *
       * Cases to consider:
       *  1. We're crossing document boundary
       *  2. Fragment is from non-entry document
       *  3. Fragment is a JSON Schema with $ref field. We need to follow it to get the eventual value
       *  4. We are dereferencing the fragment lazily/eagerly depending on circular mode
       */
      const isNonEntryDocument = url.stripHash(reference.refSet!.rootRef!.uri) !== reference.uri;
      const shouldDetectCircular = ['error', 'replace'].includes(this.options.dereference.circular);
      if (
        (isExternalReference ||
          isNonEntryDocument ||
          (isJSONSchemaElement(referencedElement) && isStringElement(referencedElement.$ref)) ||
          (shouldDetectCircular && !this.visited.has(referencedElement))) &&
        !ancestorsLineage.includesCycle(referencedElement)
      ) {
        if (shouldDetectCircular) {
          this.visited.add(referencedElement);
        }

        // append referencing reference to ancestors lineage
        directAncestors.add(referencingElement);

        const visitor = new Arazzo1DereferenceVisitor({
          reference,
          indirections: [...this.indirections],
          options: this.options,
          visited: this.visited,
          ancestors: ancestorsLineage,
        });
        referencedElement = await traverseAsync(referencedElement, visitor, {
          mutable: true,
          skipVisited: 'skip',
        });

        // remove referencing reference from ancestors lineage
        directAncestors.delete(referencingElement);
      }

      // Boolean JSON Schemas
      if (isBooleanJSONSchemaElement(referencedElement)) {
        const booleanJsonSchemaElement = cloneDeep<BooleanElement>(referencedElement);
        // annotate referenced element with info about original referencing element
        booleanJsonSchemaElement.meta.set('ref-fields', {
          $ref: toValue(referencingElement.$ref),
        });
        // annotate referenced element with info about origin
        booleanJsonSchemaElement.meta.set('ref-origin', reference.uri);
        booleanJsonSchemaElement.meta.set('ref-type', referencingElement.element);

        path.replaceWith(booleanJsonSchemaElement);
        path.skip();
        return;
      }

      /**
       * Creating a new version of JSON Schema by merging fields from referenced Schema with referencing one.
       */
      if (isJSONSchemaElement(referencedElement)) {
        const mergedElement = cloneShallow<JSONSchemaElement>(referencedElement);
        // existing keywords from referencing schema overrides ones from referenced schema
        referencingElement.forEach((value: Element, keyElement: Element, item: Element) => {
          mergedElement.remove(toValue(keyElement) as string);
          (mergedElement.content as Element[]).push(item);
        });
        mergedElement.remove('$ref');
        // annotate referenced element with info about original referencing element
        mergedElement.meta.set('ref-fields', {
          $ref: toValue(referencingElement.$ref),
        });
        // annotate fragment with info about origin
        mergedElement.meta.set('ref-origin', reference.uri);
        mergedElement.meta.set('ref-type', referencingElement.element);

        referencedElement = mergedElement;
      }
      /**
       * Transclude referencing element with merged referenced element.
       */
      path.replaceWith(referencedElement);
    } catch (error: unknown) {
      const $ref = toValue(referencingElement.$ref) as string;
      this.handleError(
        `Error while dereferencing Schema Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    } finally {
      if (this.indirections.length > indirectionsSize) this.indirections.pop();
    }
  }
}

export default Arazzo1DereferenceVisitor;
