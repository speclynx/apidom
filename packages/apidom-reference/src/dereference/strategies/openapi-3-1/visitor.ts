import { none } from 'ramda';
import { isUndefined } from 'ramda-adjunct';
import {
  isElement,
  isStringElement,
  isObjectElement,
  isParseResultElement,
  isPrimitiveElement,
  Element,
  ObjectElement,
  BooleanElement,
  ParseResultElement,
  cloneShallow,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue, fixedFields } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { traverse, find, type Path } from '@speclynx/apidom-traverse';
import {
  evaluate as jsonPointerEvaluate,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  isReferenceLikeElement,
  ReferenceElement,
  PathItemElement,
  LinkElement,
  ExampleElement,
  SchemaElement,
  isPathItemElement,
  isReferenceElement,
  isSchemaElement,
  isOperationElement,
  isBooleanJSONSchemaElement,
  refract,
  refractReference,
  refractSchema,
} from '@speclynx/apidom-ns-openapi-3-1';

import { isAnchor, uriToAnchor, locate as $anchorLocate } from './selectors/$anchor.ts';
import { locate as uriLocate, type Schema$idIndex } from './selectors/uri.ts';
import { locate as jsonPointerLocate } from './selectors/json-pointer.ts';
import EvaluationJsonSchemaUriError from '../../../errors/EvaluationJsonSchemaUriError.ts';
import DereferenceVisitor from '../DereferenceVisitor.ts';
import * as url from '../../../util/url.ts';
import Reference from '../../../Reference.ts';
import File from '../../../File.ts';
import Resolver from '../../../resolve/resolvers/Resolver.ts';
import {
  isJSONSchemaElementWith$id,
  collectSchema$ids,
  resolveSchema$ids,
  resolveSchemaBaseURI,
  resolveSchema$refField,
} from './util.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * Type a Schema Object `$ref` expects its target to have.
 */
const SCHEMA_TYPE = 'schema';

/**
 * Context of a source being dereferenced: the `$id`s of the Schema Objects enclosing it.
 */
interface OpenAPI3_1DereferenceContext {
  readonly ancestorSchema$ids: string[];
}

/**
 * @public
 */
export interface OpenAPI3_1DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly schema$idIndex?: Schema$idIndex;
  readonly ancestorSchema$ids?: string[];
}

/**
 * Dereferences an OpenAPI 3.1 document. Reference Objects expect the type of their
 * `referenced-element` meta, Path Item `$ref`s a Path Item, Schema Object `$ref`s a Schema Object.
 * Link Objects get the Operation Object they point at attached, Example Objects
 * the external value.
 *
 * @public
 */
class OpenAPI3_1DereferenceVisitor extends DereferenceVisitor<OpenAPI3_1DereferenceContext> {
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
  }: OpenAPI3_1DereferenceVisitorOptions) {
    super({ reference, options });
    this.schema$idIndex = schema$idIndex;
    this.ancestorSchema$ids = ancestorSchema$ids;
  }

  protected get strategyName(): string {
    return 'openapi-3-1';
  }

  protected createVisitor(
    reference: Reference,
    { ancestorSchema$ids }: OpenAPI3_1DereferenceContext,
  ): OpenAPI3_1DereferenceVisitor {
    return new OpenAPI3_1DereferenceVisitor({
      reference,
      options: this.options,
      schema$idIndex: this.schema$idIndex,
      ancestorSchema$ids,
    });
  }

  /**
   * A Reference Object stands for the type its reference expects: it's dereferenced as that type.
   */
  protected isOfType(element: Element, type: string): boolean {
    if (isReferenceElement(element)) return true;
    return type === SCHEMA_TYPE
      ? isSchemaElement(element) || isBooleanJSONSchemaElement(element)
      : element.element === type;
  }

  /**
   * A generic structure holding a `$ref` is a Reference Object to the expected type.
   */
  protected refractTo(element: Element, type: string): Element {
    if (type !== SCHEMA_TYPE && isReferenceLikeElement(element)) {
      const referenceElement = refractReference(element);
      referenceElement.meta.set('referenced-element', type);
      return referenceElement;
    }
    return refract(element, { element: type });
  }

  /**
   * A document as Schema Object for locating schemas within it: a generic document is
   * refracted to Schema Object once per dereference run, a semantic one is used as it is.
   */
  protected toSchemaDocument(document: Element): Element {
    if (!isPrimitiveElement(document)) return document;

    let byType = this.run.refracted.get(document);
    if (byType === undefined) {
      byType = new Map();
      this.run.refracted.set(document, byType);
    }
    let refracted = byType.get(SCHEMA_TYPE);
    if (refracted === undefined) {
      refracted = refractSchema(document);
      byType.set(SCHEMA_TYPE, refracted);
    }
    return refracted;
  }

  /**
   * Indexes the `$id`-bearing schemas of an element for the run. Transcluded elements aren't
   * indexed: they're copies of structures indexed where they're defined,
   * and in a document dereferenced in place their shared structure would be walked once per path.
   */
  protected index$ids(element: Element): void {
    if (this.schema$idIndex.has(element)) return;

    const entries: { schema: SchemaElement; $ids: string[] }[] = [];
    traverse(element, {
      enter: (path: Path<Element>) => {
        if (this.isTranscluded(path.node)) {
          path.skip();
        } else if (isJSONSchemaElementWith$id(path.node)) {
          entries.push({ schema: path.node as SchemaElement, $ids: collectSchema$ids(path) });
        }
      },
    });
    this.schema$idIndex.set(element, entries as never);
  }

  public async ReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as ReferenceElement;

    // the fields of a Reference Object hold no references
    path.skip();

    // ignore Reference Object without a string $ref, e.g. an empty YAML value
    if (this.isTranscluded(referencingElement) || !isStringElement(referencingElement.$ref)) {
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Reference Objects
    if (!this.options.resolve.internal && isInternalReference) {
      return;
    }
    // ignore resolving external Reference Objects
    if (!this.options.resolve.external && isExternalReference) {
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, $ref);

    try {
      const reference = await this.toReference($ref);
      const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
      // possibly non-semantic fragment
      const referencedElement = jsonPointerEvaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive Reference Object detected', { $ref });
      }

      const type = referencingElement.meta.get('referenced-element') as string;
      await this.addTransclusion(
        path,
        { source: referencedElement, type, reference, context: { ancestorSchema$ids: [] } },
        {
          toTranscludedElement: (element, target) => {
            // a chain of Reference Objects leading back to itself never reaches a value
            if (isReferenceElement(target)) return element;

            const reusingElement = element as ReferenceElement;
            /**
             * Creating a new version of referenced element to avoid modifying the original one.
             */
            const mergedElement = cloneShallow(target);
            // annotate fragment with info about original Reference element
            mergedElement.meta.set('ref-fields', {
              $ref,
              description: toValue(reusingElement.get('description')),
              summary: toValue(reusingElement.get('summary')),
            });
            // annotate fragment with info about origin and type
            mergedElement.meta.set('ref-origin', reference.uri);
            mergedElement.meta.set('ref-type', element.element);

            // override description and summary (outer has higher priority then inner)
            if (isObjectElement(target) && isObjectElement(mergedElement)) {
              const fields = fixedFields(target, { indexed: true });

              if (reusingElement.hasKey('description') && Object.hasOwn(fields, 'description')) {
                mergedElement.remove('description');
                mergedElement.set('description', reusingElement.get('description'));
              }
              if (reusingElement.hasKey('summary') && Object.hasOwn(fields, 'summary')) {
                mergedElement.remove('summary');
                mergedElement.set('summary', reusingElement.get('summary'));
              }
            }

            return mergedElement;
          },
          circular: { uri: $refBaseURI, meta: { uri: reference.uri, $ref }, details: { $ref } },
        },
      );
    } catch (error: unknown) {
      this.handleError(
        `Error while dereferencing Reference Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    }
  }

  public async PathItemElement(path: Path<Element>) {
    const referencingElement = path.node as PathItemElement;

    if (this.isTranscluded(referencingElement)) {
      path.skip();
      return;
    }

    // ignore PathItemElement without $ref field
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Path Item Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this Path Item element but traverse all it's child elements
      return;
    }
    // ignore resolving external Path Item Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this Path Item element but traverse all it's child elements
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, $ref);

    try {
      const reference = await this.toReference($ref);
      const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
      // possibly non-semantic referenced element
      const referencedElement = jsonPointerEvaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive Path Item Object reference detected', {
          $ref,
        });
      }

      await this.addTransclusion(
        path,
        {
          source: referencedElement,
          type: 'pathItem',
          reference,
          context: { ancestorSchema$ids: [] },
        },
        {
          toTranscludedElement: (element, target) => {
            if (!isPathItemElement(target)) return target;

            /**
             * Creating a new version of Path Item by merging fields from referenced Path Item with referencing one.
             */
            const mergedElement = cloneShallow<PathItemElement>(target);
            // existing keywords from referencing PathItemElement overrides ones from referenced element
            (element as PathItemElement).forEach(
              (value: Element, keyElement: Element, item: Element) => {
                mergedElement.remove(toValue(keyElement) as string);
                (mergedElement.content as Element[]).push(item);
              },
            );
            mergedElement.remove('$ref');

            // annotate referenced element with info about original referencing element
            mergedElement.meta.set('ref-fields', { $ref });
            // annotate referenced element with info about origin and type
            mergedElement.meta.set('ref-origin', reference.uri);
            mergedElement.meta.set('ref-type', element.element);

            return mergedElement;
          },
          // a cycle of Path Item $refs never reaches a Path Item: only the fields next to the $ref remain
          toUnresolvedElement: (element) => {
            const siblingsElement = cloneShallow(element as ObjectElement);
            siblingsElement.remove('$ref');
            return siblingsElement;
          },
          circular: { uri: $refBaseURI, meta: { uri: reference.uri, $ref }, details: { $ref } },
        },
      );
    } catch (error: unknown) {
      this.handleError(
        `Error while dereferencing Path Item Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    }
  }

  public async LinkElement(path: Path<Element>) {
    const linkElement = path.node as LinkElement;

    if (this.isTranscluded(linkElement)) {
      path.skip();
      return;
    }

    // ignore LinkElement without operationRef or operationId field
    if (!isStringElement(linkElement.operationRef) && !isStringElement(linkElement.operationId)) {
      return;
    }

    // operationRef and operationId fields are mutually exclusive
    if (isStringElement(linkElement.operationRef) && isStringElement(linkElement.operationId)) {
      throw new ApiDOMStructuredError(
        'LinkElement operationRef and operationId fields are mutually exclusive',
        {
          operationRef: toValue(linkElement.operationRef),
          operationId: toValue(linkElement.operationId),
        },
      );
    }

    try {
      if (isStringElement(linkElement.operationRef)) {
        const operationRef = toValue(linkElement.operationRef) as string;
        // possibly non-semantic referenced element
        const jsonPointer = URIFragmentIdentifier.fromURIReference(operationRef);
        const retrievalURI = this.toBaseURI(operationRef);
        const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
        const isExternalReference = !isInternalReference;

        // ignore resolving internal Operation Object reference
        if (!this.options.resolve.internal && isInternalReference) {
          // skip traversing this Link element but traverse all it's child elements
          return;
        }
        // ignore resolving external Operation Object reference
        if (!this.options.resolve.external && isExternalReference) {
          // skip traversing this Link element but traverse all it's child elements
          return;
        }

        const reference = await this.toReference(operationRef);
        const operationElement = jsonPointerEvaluate<Element>(
          (reference.value as ParseResultElement).result as Element,
          jsonPointer,
        );

        await this.addAttachment(
          path,
          {
            source: operationElement,
            type: 'operation',
            reference,
            context: { ancestorSchema$ids: [] },
          },
          (element, target) => {
            // create shallow clone to be able to annotate with metadata
            const operationCopy = cloneShallow(target);
            // annotate operation element with info about origin and type
            operationCopy.meta.set('ref-origin', reference.uri);
            operationCopy.meta.set('ref-type', element.element);

            /**
             * Transclude Link Object containing Operation Object in its meta.
             */
            const linkElementCopy = cloneShallow(element as LinkElement);
            linkElementCopy.operationRef?.meta.set('operation', operationCopy);
            return linkElementCopy;
          },
        );
        return;
      }

      const operationId = toValue(linkElement.operationId) as string;
      const reference = await this.toReference(url.unsanitize(this.reference.uri));
      const operationPath = find(
        (reference.value as ParseResultElement).result as Element,
        (p) =>
          isOperationElement(p.node) &&
          isElement(p.node.operationId) &&
          p.node.operationId.equals(operationId),
      );
      const operationElement = operationPath?.node;
      // OperationElement not found by its operationId
      if (isUndefined(operationElement)) {
        throw new ApiDOMStructuredError(`OperationElement(operationId=${operationId}) not found`, {
          operationId,
        });
      }

      await this.addAttachment(
        path,
        {
          source: operationElement,
          type: 'operation',
          reference,
          context: { ancestorSchema$ids: [] },
        },
        (element, target) => {
          /**
           * Transclude Link Object containing Operation Object in its meta.
           */
          const linkElementCopy = cloneShallow(element as LinkElement);
          linkElementCopy.operationId?.meta.set('operation', target);
          return linkElementCopy;
        },
      );
    } catch (error: unknown) {
      const refFieldName = isStringElement(linkElement.operationRef)
        ? 'operationRef'
        : 'operationId';
      const refFieldValue = isStringElement(linkElement.operationRef)
        ? (toValue(linkElement.operationRef) as string)
        : (toValue(linkElement.operationId) as string);
      this.handleError(
        `Error while dereferencing Link Object. Cannot resolve ${refFieldName} "${refFieldValue}": ${(error as Error).message}`,
        error as Error,
        linkElement,
        refFieldName,
        refFieldValue,
        path,
      );
    }
  }

  public async ExampleElement(path: Path<Element>) {
    const exampleElement = path.node as ExampleElement;

    if (this.isTranscluded(exampleElement)) {
      path.skip();
      return;
    }

    // ignore ExampleElement without externalValue field
    if (!isStringElement(exampleElement.externalValue)) {
      return;
    }

    // value and externalValue fields are mutually exclusive
    if (exampleElement.hasKey('value') && isStringElement(exampleElement.externalValue)) {
      throw new ApiDOMStructuredError(
        'ExampleElement value and externalValue fields are mutually exclusive',
        {
          value: toValue(exampleElement.value),
          externalValue: toValue(exampleElement.externalValue),
        },
      );
    }

    const externalValue = toValue(exampleElement.externalValue) as string;
    const retrievalURI = this.toBaseURI(externalValue);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Example Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this Example element but traverse all it's child elements
      return;
    }
    // ignore resolving external Example Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this Example element but traverse all it's child elements
      return;
    }

    try {
      const reference = await this.toReference(externalValue);
      const valueSource = (reference.value as ParseResultElement).result as Element;

      await this.addAttachment(
        path,
        {
          source: valueSource,
          type: valueSource.element,
          reference,
          context: { ancestorSchema$ids: [] },
        },
        (element, target) => {
          // shallow clone of the referenced element
          const valueElement = cloneShallow(target);
          // annotate element with info about origin and type
          valueElement.meta.set('ref-origin', reference.uri);
          valueElement.meta.set('ref-type', element.element);

          /**
           * Transclude Example Object containing external value.
           */
          const exampleElementCopy = cloneShallow(element as ExampleElement);
          exampleElementCopy.value = valueElement;
          return exampleElementCopy;
        },
      );
    } catch (error: unknown) {
      this.handleError(
        `Error while dereferencing Example Object. Cannot resolve externalValue "${externalValue}": ${(error as Error).message}`,
        error as Error,
        exampleElement,
        'externalValue',
        externalValue,
        path,
      );
    }
  }

  public async SchemaElement(path: Path<Element>) {
    const referencingElement = path.node as SchemaElement;

    if (this.isTranscluded(referencingElement)) {
      path.skip();
      return;
    }

    // skip current referencing schema as $ref keyword was not defined
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    try {
      // compute baseURI using rules around $id and $ref keywords
      let reference = await this.toReference(url.unsanitize(this.reference.uri));
      let { uri: retrievalURI } = reference;
      // base URI in effect at the traversal root: the document base refined by
      // the $ids of the schemas enclosing the root when the root is a fragment
      const rootBaseURI = resolveSchema$ids(retrievalURI, this.ancestorSchema$ids);
      const schemaBaseURI = resolveSchemaBaseURI(rootBaseURI, path);
      const $refBaseURI = resolveSchema$refField(schemaBaseURI, referencingElement)!;
      const $refBaseURIStrippedHash = url.stripHash($refBaseURI);
      const file = new File({ uri: $refBaseURIStrippedHash });
      const isUnknownURI = none((r: Resolver) => r.canRead(file), this.options.resolve.resolvers);
      const isURL = !isUnknownURI;
      let isInternalReference = url.stripHash(this.reference.uri) === $refBaseURI;
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
          // the fragment being traversed is searched before the whole document: a
          // fragment referenced from another document (a Response, Parameter, Path
          // Item, ...) is refracted with its own semantics, so the Schema Objects it
          // contains are indexed, whereas the referenced document as a whole is
          // parsed generically and refracted as a bare JSON Schema, which leaves
          // those Schema Objects (under `content`, `schema`, ...) unrecognized and
          // their `$id`s out of the index
          const documentElement = (reference.value as ParseResultElement).result as Element;
          const rootNode = path.getAncestorNodes().at(-1) ?? path.node;
          const fragmentElement = isParseResultElement(rootNode)
            ? (rootNode.result as Element)
            : rootNode;
          try {
            // the fragment's $ids resolve against the base its enclosing chain
            // leaves in effect, which then also prefixes the located schema's chain
            const fragmentAsSchema = this.toSchemaDocument(fragmentElement);
            this.index$ids(fragmentAsSchema);
            ({ element: referencedElement, ancestorSchema$ids } = uriLocate(
              selector,
              fragmentAsSchema,
              { baseURI: rootBaseURI, index: this.schema$idIndex },
            ));
            ancestorSchema$ids = [...this.ancestorSchema$ids, ...ancestorSchema$ids];
          } catch (error) {
            if (
              !(error instanceof EvaluationJsonSchemaUriError) ||
              fragmentElement === documentElement
            ) {
              throw error;
            }
            // the document index is rooted at the document, so the located chain
            // is already document-relative and takes no prefix
            const documentAsSchema = this.toSchemaDocument(documentElement);
            this.index$ids(documentAsSchema);
            ({ element: referencedElement, ancestorSchema$ids } = uriLocate(
              selector,
              documentAsSchema,
              { baseURI: reference.uri, index: this.schema$idIndex },
            ));
          }

          // ignore resolving internal Schema Objects
          if (!this.options.resolve.internal && isInternalReference) {
            // skip traversing this schema element but traverse all it's child elements
            return;
          }
          // ignore resolving external Schema Objects
          if (!this.options.resolve.external && isExternalReference) {
            // skip traversing this schema element but traverse all it's child elements
            return;
          }
        } else {
          // we're assuming here that we're dealing with JSON Pointer here
          retrievalURI = this.toBaseURI($refBaseURI);
          isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
          isExternalReference = !isInternalReference;

          // ignore resolving internal Schema Objects
          if (!this.options.resolve.internal && isInternalReference) {
            // skip traversing this schema element but traverse all it's child elements
            return;
          }
          // ignore resolving external Schema Objects
          if (!this.options.resolve.external && isExternalReference) {
            // skip traversing this schema element but traverse all it's child elements
            return;
          }

          reference = await this.toReference(url.unsanitize($refBaseURI));
          const selector = URIFragmentIdentifier.fromURIReference($refBaseURI);
          ({ element: referencedElement, ancestorSchema$ids } = jsonPointerLocate(
            this.toSchemaDocument((reference.value as ParseResultElement).result as Element),
            selector,
          ));
        }
      } catch (error) {
        /**
         * SchemaElement($id=URL) was not found, so we're going to try to resolve
         * the URL and assume the returned response is a JSON Schema.
         */
        if (isURL && error instanceof EvaluationJsonSchemaUriError) {
          if (isAnchor(uriToAnchor($refBaseURI))) {
            // we're dealing with JSON Schema $anchor here
            isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
            isExternalReference = !isInternalReference;

            // ignore resolving internal Schema Objects
            if (!this.options.resolve.internal && isInternalReference) {
              // skip traversing this schema element but traverse all it's child elements
              return;
            }
            // ignore resolving external Schema Objects
            if (!this.options.resolve.external && isExternalReference) {
              // skip traversing this schema element but traverse all it's child elements
              return;
            }

            reference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = uriToAnchor($refBaseURI);
            ({ element: referencedElement, ancestorSchema$ids } = $anchorLocate(
              selector,
              this.toSchemaDocument((reference.value as ParseResultElement).result as Element),
            ));
          } else {
            // we're assuming here that we're dealing with JSON Pointer here
            retrievalURI = this.toBaseURI($refBaseURI);
            isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
            isExternalReference = !isInternalReference;

            // ignore resolving internal Schema Objects
            if (!this.options.resolve.internal && isInternalReference) {
              // skip traversing this schema element but traverse all it's child elements
              return;
            }
            // ignore resolving external Schema Objects
            if (!this.options.resolve.external && isExternalReference) {
              // skip traversing this schema element but traverse all it's child elements
              return;
            }

            reference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = URIFragmentIdentifier.fromURIReference($refBaseURI);
            ({ element: referencedElement, ancestorSchema$ids } = jsonPointerLocate(
              this.toSchemaDocument((reference.value as ParseResultElement).result as Element),
              selector,
            ));
          }
        } else {
          throw error;
        }
      }

      const $ref = toValue(referencingElement.$ref) as string;

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive Schema Object reference detected', { $ref });
      }

      const origin = reference.uri;
      // a Schema Object $ref reads whatever it points at as a Schema Object
      await this.addTransclusion(
        path,
        {
          source: referencedElement,
          type: SCHEMA_TYPE,
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
              // annotate referenced element with info about origin and type
              booleanJsonSchemaElement.meta.set('ref-origin', origin);
              booleanJsonSchemaElement.meta.set('ref-type', element.element);
              return booleanJsonSchemaElement;
            }

            if (!isSchemaElement(target)) return target;

            /**
             * Creating a new version of Schema Object by merging fields from referenced Schema Object with referencing one.
             */
            const mergedElement = cloneShallow<SchemaElement>(target);
            // existing keywords from referencing schema overrides ones from referenced schema
            (element as SchemaElement).forEach(
              (value: Element, keyElement: Element, item: Element) => {
                mergedElement.remove(toValue(keyElement) as string);
                (mergedElement.content as Element[]).push(item);
              },
            );
            mergedElement.remove('$ref');
            // annotate referenced element with info about original referencing element
            mergedElement.meta.set('ref-fields', { $ref });
            // annotate fragment with info about origin and type
            mergedElement.meta.set('ref-origin', origin);
            mergedElement.meta.set('ref-type', element.element);

            return mergedElement;
          },
          // a cycle of $ref aliases never reaches a schema: only the keywords next to the $ref remain
          toUnresolvedElement: (element) => {
            const siblingsElement = cloneShallow(element as ObjectElement);
            siblingsElement.remove('$ref');
            return siblingsElement;
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

export default OpenAPI3_1DereferenceVisitor;
