import { propEq, none } from 'ramda';
import {
  isElement,
  isStringElement,
  Element,
  RefElement,
  BooleanElement,
  Namespace,
  ParseResultElement,
  cloneShallow,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { IdentityManager, toValue } from '@speclynx/apidom-core';
import { ApiDOMError } from '@speclynx/apidom-error';
import { traverseAsync, Path } from '@speclynx/apidom-traverse';
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
import { maybeRefractToJSONSchemaElement } from './util.ts';
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

// initialize element identity manager
const identityManager = new IdentityManager();

/**
 * @public
 */
export interface Arazzo1DereferenceVisitorOptions {
  readonly namespace: Namespace;
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly indirections?: Element[];
  readonly ancestors?: AncestorLineage<Element>;
}

/**
 * @public
 */
class Arazzo1DereferenceVisitor {
  protected readonly indirections: Element[];

  protected readonly namespace: Namespace;

  protected readonly reference: Reference;

  protected readonly options: ReferenceOptions;

  protected readonly ancestors: AncestorLineage<Element>;

  constructor({
    reference,
    namespace,
    options,
    indirections = [],
    ancestors = new AncestorLineage(),
  }: Arazzo1DereferenceVisitorOptions) {
    this.indirections = indirections;
    this.namespace = namespace;
    this.reference = reference;
    this.options = options;
    this.ancestors = new AncestorLineage(...ancestors);
  }

  protected toBaseURI(uri: string): string {
    return url.resolve(this.reference.uri, url.sanitize(url.stripHash(uri)));
  }

  protected async toReference(uri: string): Promise<Reference> {
    // detect maximum depth of resolution
    if (this.reference.depth >= this.options.resolve.maxDepth) {
      throw new MaximumResolveDepthError(
        `Maximum resolution depth of ${this.options.resolve.maxDepth} has been exceeded by file "${this.reference.uri}"`,
      );
    }

    const baseURI = this.toBaseURI(uri);
    const { refSet } = this.reference as { refSet: ReferenceSet };

    // we've already processed this Reference in past
    if (refSet.has(baseURI)) {
      return refSet.find(propEq(baseURI, 'uri'))!;
    }

    const parseResult = await parse(url.unsanitize(baseURI), {
      ...this.options,
      parse: { ...this.options.parse, mediaType: 'text/plain' },
    });

    // register new mutable reference with a refSet
    const mutableReference = new Reference({
      uri: baseURI,
      value: cloneDeep(parseResult),
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

  protected toAncestorLineage(path: Path<Element>): [AncestorLineage<Element>, Set<Element>] {
    /**
     * Compute full ancestors lineage.
     * Ancestors are flatten to unwrap all Element instances.
     */
    const ancestorNodes = path.getAncestorNodes();
    const directAncestors = new Set<Element>(ancestorNodes.filter(isElement));
    const ancestorsLineage = new AncestorLineage(...this.ancestors, directAncestors);

    return [ancestorsLineage, directAncestors];
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
      throw new ApiDOMError(`Invalid Reusable Object reference format: "${runtimeExpression}"`);
    }

    // ReusableElement can only reference components
    if (tree.type !== 'ComponentsExpression') {
      throw new ApiDOMError(
        `Reusable Object reference "${runtimeExpression}" must be a components expression`,
      );
    }

    // evaluate runtime expression as JSON Pointer to get the referenced element
    const jsonPointer = jsonPointerCompile(['components', tree.field, tree.subField]);
    let referencedElement: Element;
    try {
      referencedElement = jsonPointerEvaluate<Element>(
        (this.reference.value as ParseResultElement).result as ArazzoSpecification1Element,
        jsonPointer,
      );
    } catch {
      throw new ApiDOMError(`Reusable Object reference "${runtimeExpression}" cannot be resolved`);
    }

    /**
     * Create a shallow clone of the referenced element to avoid modifying the original.
     */
    const mergedElement = cloneShallow(referencedElement);
    // assign unique id to merged element
    mergedElement.meta.set('id', identityManager.generateId());
    // annotate with info about original referencing element
    mergedElement.meta.set('ref-fields', {
      reference: runtimeExpression,
      value: toValue(referencingElement.value),
    });
    // annotate with info about origin
    mergedElement.meta.set('ref-origin', this.reference.uri);
    // annotate with info about referencing element
    mergedElement.meta.set(
      'ref-referencing-element-id',
      identityManager.identify(referencingElement),
    );

    // override value field if present for Parameter Objects
    if (isParameterElement(mergedElement) && referencingElement.hasKey('value')) {
      mergedElement.remove('value');
      mergedElement.set('value', referencingElement.get('value'));
    }

    /**
     * Transclude referencing element with merged referenced element.
     */
    path.replaceWith(mergedElement);
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

    const [ancestorsLineage, directAncestors] = this.toAncestorLineage(path);

    // compute baseURI using rules around $id and $ref keywords
    let reference = await this.toReference(url.unsanitize(this.reference.uri));
    let { uri: retrievalURI } = reference;
    const $refBaseURI = resolveSchema$refField(retrievalURI, referencingElement)!;
    const $refBaseURIStrippedHash = url.stripHash($refBaseURI);
    const file = new File({ uri: $refBaseURIStrippedHash });
    const isUnknownURI = none((r: Resolver) => r.canRead(file), this.options.resolve.resolvers);
    const isURL = !isUnknownURI;
    let isInternalReference = url.stripHash(this.reference.uri) === $refBaseURI;
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
        referencedElement.id = identityManager.identify(referencedElement);

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
        isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
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
        referencedElement.id = identityManager.identify(referencedElement);
      }
    } catch (error) {
      /**
       * No JSONSchemaElement($id=URL) was not found, so we're going to try to resolve
       * the URL and assume the returned response is a JSON Schema.
       */
      if (isURL && error instanceof EvaluationJsonSchemaUriError) {
        if (isAnchor(uriToAnchor($refBaseURI))) {
          // we're dealing with JSON Schema $anchor here
          isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
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
          referencedElement.id = identityManager.identify(referencedElement);
        } else {
          // we're assuming here that we're dealing with JSON Pointer here
          retrievalURI = this.toBaseURI($refBaseURI);
          isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
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
          referencedElement.id = identityManager.identify(referencedElement);
        }
      } else {
        throw error;
      }
    }

    this.indirections.push(referencingElement);

    // detect direct or indirect reference
    if (referencingElement === referencedElement) {
      throw new ApiDOMError('Recursive JSON Schema reference detected');
    }

    // detect maximum depth of dereferencing
    if (this.indirections.length > this.options.dereference.maxDepth) {
      throw new MaximumDereferenceDepthError(
        `Maximum dereference depth of "${this.options.dereference.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
      );
    }

    // detect second deep dive into the same fragment and avoid it
    if (ancestorsLineage.includes(referencedElement)) {
      reference.refSet!.circular = true;

      if (this.options.dereference.circular === 'error') {
        throw new ApiDOMError('Circular reference detected');
      } else if (this.options.dereference.circular === 'replace') {
        const refElement = new RefElement(referencedElement.id, {
          type: 'json-schema',
          uri: reference.uri,
          $ref: toValue(referencingElement.$ref),
        });
        const replacer =
          this.options.dereference.strategyOpts['arazzo-1']?.circularReplacer ??
          this.options.dereference.circularReplacer;
        const replacement = replacer(refElement);

        this.indirections.pop();
        path.replaceWith(replacement);
        return;
      }
    }

    /**
     * Dive deep into the fragment.
     *
     * Cases to consider:
     *  1. We're crossing document boundary
     *  2. Fragment is from non-root document
     *  3. Fragment is a JSON Schema with $ref field. We need to follow it to get the eventual value
     *  4. We are dereferencing the fragment lazily/eagerly depending on circular mode
     */
    const isNonRootDocument = url.stripHash(reference.refSet!.rootRef!.uri) !== reference.uri;
    const shouldDetectCircular = ['error', 'replace'].includes(this.options.dereference.circular);
    if (
      (isExternalReference ||
        isNonRootDocument ||
        (isJSONSchemaElement(referencedElement) && isStringElement(referencedElement.$ref)) ||
        shouldDetectCircular) &&
      !ancestorsLineage.includesCycle(referencedElement)
    ) {
      // append referencing reference to ancestors lineage
      directAncestors.add(referencingElement);

      const visitor = new Arazzo1DereferenceVisitor({
        reference,
        namespace: this.namespace,
        indirections: [...this.indirections],
        options: this.options,
        ancestors: ancestorsLineage,
      });
      referencedElement = await traverseAsync(referencedElement, visitor, { mutable: true });

      // remove referencing reference from ancestors lineage
      directAncestors.delete(referencingElement);
    }

    this.indirections.pop();

    // Boolean JSON Schemas
    if (isBooleanJSONSchemaElement(referencedElement)) {
      const booleanJsonSchemaElement = cloneDeep<BooleanElement>(referencedElement);
      // assign unique id to merged element
      booleanJsonSchemaElement.meta.set('id', identityManager.generateId());
      // annotate referenced element with info about original referencing element
      booleanJsonSchemaElement.meta.set('ref-fields', {
        $ref: toValue(referencingElement.$ref),
      });
      // annotate referenced element with info about origin
      booleanJsonSchemaElement.meta.set('ref-origin', reference.uri);
      // annotate fragment with info about referencing element
      booleanJsonSchemaElement.meta.set(
        'ref-referencing-element-id',
        cloneDeep(identityManager.identify(referencingElement)),
      );

      path.replaceWith(booleanJsonSchemaElement);
      return;
    }

    /**
     * Creating a new version of JSON Schema by merging fields from referenced Schema with referencing one.
     */
    if (isJSONSchemaElement(referencedElement)) {
      const mergedElement = cloneShallow<JSONSchemaElement>(referencedElement);
      // assign unique id to merged element
      mergedElement.meta.set('id', identityManager.generateId());
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
      // annotate fragment with info about referencing element
      mergedElement.meta.set(
        'ref-referencing-element-id',
        cloneDeep(identityManager.identify(referencingElement)),
      );

      referencedElement = mergedElement;
    }
    /**
     * Transclude referencing element with merged referenced element.
     */
    path.replaceWith(referencedElement);
  }
}

export default Arazzo1DereferenceVisitor;
