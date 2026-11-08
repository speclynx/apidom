import { none } from 'ramda';
import {
  isStringElement,
  isParseResultElement,
  isPrimitiveElement,
  includesClasses,
  Element,
  BooleanElement,
  ParseResultElement,
  cloneShallow,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { traverse, type Path } from '@speclynx/apidom-traverse';
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
  refract,
  refractJSONSchema,
} from '@speclynx/apidom-ns-arazzo-1';
import { parse as parseRuntimeExpression } from '@swaggerexpert/arazzo-runtime-expression';

import { isAnchor, uriToAnchor, locate as $anchorLocate } from './selectors/$anchor.ts';
import { locate as uriLocate, type Schema$idIndex } from './selectors/uri.ts';
import { locate as jsonPointerLocate } from '../openapi-3-1/selectors/json-pointer.ts';
import {
  isJSONSchemaElementWith$id,
  collectSchema$ids,
  resolveSchema$ids,
  resolveSchemaBaseURI,
  resolveSchema$refField,
} from '../openapi-3-1/util.ts';
import { resolveArazzo$selfField, identifiedBy$self } from './util.ts';
import DereferenceVisitor from '../DereferenceVisitor.ts';
import * as url from '../../../util/url.ts';
import Reference from '../../../Reference.ts';
import File from '../../../File.ts';
import Resolver from '../../../resolve/resolvers/Resolver.ts';
import EvaluationJsonSchemaUriError from '../../../errors/EvaluationJsonSchemaUriError.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * Type a JSON Schema `$ref` expects its target to have.
 */
const JSON_SCHEMA_TYPE = 'JSONSchema';

/**
 * Context of a source being dereferenced: the `$id`s of the JSON Schema elements enclosing it.
 */
interface Arazzo1DereferenceContext {
  readonly ancestorSchema$ids: string[];
}

/**
 * @public
 */
export interface Arazzo1DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly schema$idIndex?: Schema$idIndex;
  readonly ancestorSchema$ids?: string[];
}

/**
 * Dereferences an Arazzo document. Reusable Objects expect the type of their
 * `referenced-element` meta, JSON Schema `$ref`s expect a JSON Schema.
 *
 * @public
 */
class Arazzo1DereferenceVisitor extends DereferenceVisitor<Arazzo1DereferenceContext> {
  /**
   * Index of `$id`-bearing schemas per document, shared across the visitors
   * of a single dereference run.
   */
  protected readonly schema$idIndex: Schema$idIndex;

  /**
   * `$id`s of the JSON Schema elements enclosing the traversal root within its
   * document (outermost first). Empty when the root is the document itself; a
   * visitor traversing a fragment is seeded with the `$id`s of the schemas the
   * fragment sits under, so the `$ref`s and `$id`s within resolve against the
   * same base as they would from the document root.
   */
  protected readonly ancestorSchema$ids: string[];

  constructor({
    reference,
    options,
    schema$idIndex = new WeakMap(),
    ancestorSchema$ids = [],
  }: Arazzo1DereferenceVisitorOptions) {
    super({ reference, options });
    this.schema$idIndex = schema$idIndex;
    this.ancestorSchema$ids = ancestorSchema$ids;
  }

  protected get strategyName(): string {
    return 'arazzo-1';
  }

  protected createVisitor(
    reference: Reference,
    { ancestorSchema$ids }: Arazzo1DereferenceContext,
  ): Arazzo1DereferenceVisitor {
    return new Arazzo1DereferenceVisitor({
      reference,
      options: this.options,
      schema$idIndex: this.schema$idIndex,
      ancestorSchema$ids,
    });
  }

  protected refractTo(element: Element, type: string): Element {
    return type === JSON_SCHEMA_TYPE
      ? refractJSONSchema(element)
      : refract(element, { element: type });
  }

  protected isOfType(element: Element, type: string): boolean {
    return type === JSON_SCHEMA_TYPE
      ? isJSONSchemaElement(element) || isBooleanJSONSchemaElement(element)
      : element.element === type;
  }

  /**
   * Honors the Arazzo `$self` field when present, otherwise falls back to the retrieval URI.
   */
  protected toDocumentBaseURI(reference: Reference): string {
    return resolveArazzo$selfField(
      reference.uri,
      (reference.value as ParseResultElement | undefined)?.result,
    );
  }

  /**
   * Identity-based referencing: URI matches `$self` of an already processed Arazzo document.
   */
  protected findReferenceByIdentity(uri: string): Reference | undefined {
    return this.reference.refSet?.find(identifiedBy$self(uri));
  }

  /**
   * A document as JSON Schema for locating schemas within it: a generic document is
   * refracted to JSON Schema once per dereference run, a semantic one is used as it is.
   */
  protected toJSONSchemaDocument(document: Element): Element {
    if (!isPrimitiveElement(document)) return document;

    let byType = this.run.refracted.get(document);
    if (byType === undefined) {
      byType = new Map();
      this.run.refracted.set(document, byType);
    }
    let refracted = byType.get(JSON_SCHEMA_TYPE);
    if (refracted === undefined) {
      refracted = refractJSONSchema(document);
      byType.set(JSON_SCHEMA_TYPE, refracted);
    }
    return refracted;
  }

  /**
   * Indexes the `$id`-bearing schemas of a document for the run. Transcluded elements aren't
   * indexed: they're copies of structures indexed where they're defined,
   * and in a document dereferenced in place their shared structure would be walked once per path.
   */
  protected index$ids(element: Element): void {
    if (this.schema$idIndex.has(element)) return;

    const entries: { schema: JSONSchemaElement; $ids: string[] }[] = [];
    traverse(element, {
      enter: (path: Path<Element>) => {
        if (this.isTranscluded(path.node)) {
          path.skip();
        } else if (isJSONSchemaElementWith$id(path.node)) {
          entries.push({ schema: path.node as JSONSchemaElement, $ids: collectSchema$ids(path) });
        }
      },
    });
    this.schema$idIndex.set(element, entries);
  }

  public enter(path: Path<Element>) {
    if (this.isTranscluded(path.node)) {
      path.skip();
      return;
    }
    // a Source Description parsed into the document has its own components: it's dereferenced
    // in its own context by the strategy, never by the document referencing it
    if (
      path.parentPath !== null &&
      isParseResultElement(path.node) &&
      includesClasses(path.node, ['source-description'])
    ) {
      path.skip();
    }
  }

  public async ReusableElement(path: Path<Element>) {
    const referencingElement = path.node as ReusableElement;

    // the fields of a Reusable Object hold no references
    path.skip();

    // skip current Reusable Object if reference field is not defined as a string
    if (!isStringElement(referencingElement.reference)) {
      return;
    }

    // ignore if resolve.internal is false (Reusable Objects are internal references only)
    if (!this.options.resolve.internal) {
      return;
    }

    const runtimeExpression = toValue(referencingElement.reference) as string;

    try {
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
      const jsonPointer = jsonPointerCompile([
        'components',
        tree.componentType,
        tree.componentName,
      ]);
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

      // the reference decides the type of the referenced component
      const type =
        (toValue(referencingElement.meta.get('referenced-element')) as string | undefined) ??
        referencedElement.element;

      await this.addTransclusion(
        path,
        {
          source: referencedElement,
          type,
          reference: this.reference,
          context: { ancestorSchema$ids: [] },
        },
        {
          toTranscludedElement: (element, target) => {
            const reusableElement = element as ReusableElement;
            const mergedElement = cloneShallow(target);
            // annotate with info about original referencing element
            mergedElement.meta.set('ref-fields', {
              reference: runtimeExpression,
              value: toValue(reusableElement.value),
            });
            // annotate with info about origin
            mergedElement.meta.set('ref-origin', this.reference.uri);
            mergedElement.meta.set('ref-type', element.element);

            // override value field if present for Parameter Objects
            if (isParameterElement(mergedElement) && reusableElement.hasKey('value')) {
              mergedElement.remove('value');
              mergedElement.set('value', reusableElement.get('value'));
            }

            return mergedElement;
          },
          circular: {
            uri: runtimeExpression,
            meta: { uri: this.reference.uri, reference: runtimeExpression },
            details: { runtimeExpression },
          },
        },
      );
    } catch (error: unknown) {
      this.handleError(
        `Error while dereferencing Reusable Object. Cannot resolve reference "${runtimeExpression}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        'reference',
        runtimeExpression,
        path,
      );
    }
  }

  public async JSONSchemaElement(path: Path<Element>) {
    const referencingElement = path.node as JSONSchemaElement;

    if (this.isTranscluded(referencingElement)) {
      path.skip();
      return;
    }

    // skip current referencing schema as $ref keyword was not defined
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    try {
      // compute baseURI using rules around $self, $id and $ref keywords
      let reference = await this.toReference(url.unsanitize(this.reference.uri));
      let { uri: retrievalURI } = reference;
      // base URI in effect at the traversal root: the document base refined by
      // the $ids of the schemas enclosing the root when the root is a fragment
      const rootBaseURI = resolveSchema$ids(this.baseURI, this.ancestorSchema$ids);
      const schemaBaseURI = resolveSchemaBaseURI(rootBaseURI, path);
      const $refBaseURI = resolveSchema$refField(schemaBaseURI, referencingElement)!;
      const $refBaseURIStrippedHash = url.stripHash($refBaseURI);
      const file = new File({ uri: $refBaseURIStrippedHash });
      const isUnknownURI = none((r: Resolver) => r.canRead(file), this.options.resolve.resolvers);
      const isURL = !isUnknownURI;
      let isInternalReference = this.baseURI === $refBaseURI;
      let isExternalReference = !isInternalReference;

      // determining reference, proper evaluation and selection mechanism
      let referencedElement: Element;
      // $ids of the schemas enclosing the referenced element within its document
      let ancestorSchema$ids: string[];

      try {
        if (isUnknownURI || isURL) {
          // we're dealing with canonical URI or URL with possible fragment
          retrievalURI = this.toBaseURI($refBaseURI);
          const selector = $refBaseURI;
          const documentElement = (reference.value as ParseResultElement).result as Element;
          const referenceAsSchema = this.toJSONSchemaDocument(documentElement);
          this.index$ids(referenceAsSchema);
          // a document that is itself a fragment detached from its source carries
          // the $ids enclosing it only as `ancestorSchema$ids`: its $ids are then
          // indexed against the base that chain leaves in effect, and the chain
          // prefixes the one of the located schema. A visitor rooted at a
          // fragment of a whole document indexes that document against its own base.
          const rootNode = path.getAncestorNodes().at(-1) ?? path.node;
          const isDocumentRoot =
            (isParseResultElement(rootNode) ? rootNode.result : rootNode) === documentElement;
          ({ element: referencedElement, ancestorSchema$ids } = uriLocate(
            selector,
            referenceAsSchema,
            {
              baseURI: isDocumentRoot ? rootBaseURI : this.baseURI,
              index: this.schema$idIndex,
            },
          ));
          if (isDocumentRoot) {
            ancestorSchema$ids = [...this.ancestorSchema$ids, ...ancestorSchema$ids];
          }

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
          const referenceAsSchema = this.toJSONSchemaDocument(
            (reference.value as ParseResultElement).result as Element,
          );
          ({ element: referencedElement, ancestorSchema$ids } = jsonPointerLocate(
            referenceAsSchema,
            selector,
          ));
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
            const referenceAsSchema = this.toJSONSchemaDocument(
              (reference.value as ParseResultElement).result as Element,
            );
            ({ element: referencedElement, ancestorSchema$ids } = $anchorLocate(
              selector,
              referenceAsSchema,
            ));
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
            const referenceAsSchema = this.toJSONSchemaDocument(
              (reference.value as ParseResultElement).result as Element,
            );
            ({ element: referencedElement, ancestorSchema$ids } = jsonPointerLocate(
              referenceAsSchema,
              selector,
            ));
          }
        } else {
          throw error;
        }
      }

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive JSON Schema reference detected', {
          $ref: toValue(referencingElement.$ref),
        });
      }

      // a JSON Schema $ref reads whatever it points at as a JSON Schema
      const $ref = toValue(referencingElement.$ref) as string;
      const origin = reference.uri;
      await this.addTransclusion(
        path,
        {
          source: referencedElement,
          type: JSON_SCHEMA_TYPE,
          reference,
          context: { ancestorSchema$ids },
        },
        {
          toTranscludedElement: (element, target) => {
            // Boolean JSON Schemas
            if (isBooleanJSONSchemaElement(target)) {
              const booleanJsonSchemaElement = cloneDeep<BooleanElement>(target);
              // annotate referenced element with info about original referencing element
              booleanJsonSchemaElement.meta.set('ref-fields', { $ref });
              // annotate referenced element with info about origin
              booleanJsonSchemaElement.meta.set('ref-origin', origin);
              booleanJsonSchemaElement.meta.set('ref-type', element.element);
              return booleanJsonSchemaElement;
            }

            if (!isJSONSchemaElement(target)) return target;

            /**
             * Creating a new version of JSON Schema by merging fields from referenced Schema with referencing one.
             */
            const mergedElement = cloneShallow<JSONSchemaElement>(target);
            // existing keywords from referencing schema overrides ones from referenced schema
            (element as JSONSchemaElement).forEach(
              (value: Element, keyElement: Element, item: Element) => {
                mergedElement.remove(toValue(keyElement) as string);
                (mergedElement.content as Element[]).push(item);
              },
            );
            mergedElement.remove('$ref');
            // annotate referenced element with info about original referencing element
            mergedElement.meta.set('ref-fields', { $ref });
            // annotate fragment with info about origin
            mergedElement.meta.set('ref-origin', origin);
            mergedElement.meta.set('ref-type', element.element);

            return mergedElement;
          },
          circular: { uri: $refBaseURI, meta: { uri: origin, $ref }, details: { $ref } },
        },
      );
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
    }
  }
}

export default Arazzo1DereferenceVisitor;
