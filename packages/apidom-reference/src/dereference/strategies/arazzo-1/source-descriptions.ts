import {
  Element,
  ParseResultElement,
  AnnotationElement,
  isArrayElement,
  isStringElement,
  isParseResultElement,
} from '@speclynx/apidom-datamodel';
import {
  isArazzoSpecification1Element,
  isSourceDescriptionElement,
  SourceDescriptionElement,
} from '@speclynx/apidom-ns-arazzo-1';
import { isSwaggerElement } from '@speclynx/apidom-ns-openapi-2';
import { isOpenApi3_0Element } from '@speclynx/apidom-ns-openapi-3-0';
import { isOpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';
import { toValue } from '@speclynx/apidom-core';

import * as url from '../../../util/url.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { merge as mergeOptions } from '../../../options/util.ts';
import dereference, { dereferenceApiDOM } from '../../index.ts';
import { resolveArazzo$selfField } from './util.ts';

interface DereferenceSourceDescriptionContext {
  baseURI: string;
  options: ReferenceOptions;
  strategyName: string;
  currentDepth: number;
  // URIs of the documents currently being dereferenced, from the root down to the current one
  ancestors: string[];
  // source description results of documents dereferenced so far, keyed by their URIs
  dereferenced: Map<string, ParseResultElement>;
}

/**
 * Validates that the dereferenced document is an OpenAPI or Arazzo document
 * and that it matches the type declared by the source description.
 */
function validateSourceDescriptionAPI(
  parseResult: ParseResultElement,
  sourceDescription: SourceDescriptionElement,
  sourceDescriptionAPI: Element | undefined,
  retrievalURI: string,
): void {
  // only allow OpenAPI and Arazzo as source descriptions
  const isOpenApi =
    isSwaggerElement(sourceDescriptionAPI) ||
    isOpenApi3_0Element(sourceDescriptionAPI) ||
    isOpenApi3_1Element(sourceDescriptionAPI);
  const isArazzo = isArazzoSpecification1Element(sourceDescriptionAPI);

  if (!isOpenApi && !isArazzo) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" is not an OpenAPI or Arazzo document`,
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return;
  }

  // validate declared type matches actual dereferenced type
  const declaredType = toValue(sourceDescription.type);
  if (typeof declaredType === 'string') {
    if (declaredType === 'openapi' && !isOpenApi) {
      const annotation = new AnnotationElement(
        `Source description "${retrievalURI}" declared as "openapi" but dereferenced as Arazzo document`,
      );
      annotation.classes.push('warning');
      parseResult.push(annotation);
    } else if (declaredType === 'arazzo' && !isArazzo) {
      const annotation = new AnnotationElement(
        `Source description "${retrievalURI}" declared as "arazzo" but dereferenced as OpenAPI document`,
      );
      annotation.classes.push('warning');
      parseResult.push(annotation);
    }
  }
}

/**
 * Dereferences a single source description element.
 * Returns ParseResultElement on success, or with annotation if skipped.
 */
async function dereferenceSourceDescription(
  sourceDescription: Element,
  ctx: DereferenceSourceDescriptionContext,
): Promise<ParseResultElement> {
  const parseResult = new ParseResultElement();

  if (!isSourceDescriptionElement(sourceDescription)) {
    const annotation = new AnnotationElement(
      'Element is not a valid SourceDescriptionElement. Skipping',
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }

  // set class and metadata from source description element
  parseResult.classes.push('source-description');
  if (isStringElement(sourceDescription.name))
    parseResult.setMetaProperty('name', toValue(sourceDescription.name) as string);
  if (isStringElement(sourceDescription.type))
    parseResult.setMetaProperty('type', toValue(sourceDescription.type) as string);

  const sourceDescriptionURI = toValue(sourceDescription.url);
  if (typeof sourceDescriptionURI !== 'string') {
    const annotation = new AnnotationElement(
      'Source description URL is missing or not a string. Skipping',
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }

  // normalize URI for consistent cycle detection and refSet cache key matching
  const retrievalURI = url.sanitize(url.stripHash(url.resolve(ctx.baseURI, sourceDescriptionURI)));
  parseResult.setMetaProperty('retrievalURI', retrievalURI);

  // skip if the document is still being dereferenced higher up the chain (cycle detection)
  if (ctx.ancestors.includes(retrievalURI)) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" has already been visited. Skipping to prevent cycle`,
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }

  // a document reached again through a different path is a shared dependency, not a cycle;
  // point at the result where it was dereferenced instead of dereferencing it again
  const existingDereferenceResult = ctx.dereferenced.get(retrievalURI);
  if (existingDereferenceResult !== undefined) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" has already been dereferenced. Reusing existing dereference result`,
    );
    annotation.classes.push('info');
    parseResult.push(annotation);
    parseResult.meta.set('parseResult', existingDereferenceResult);
    validateSourceDescriptionAPI(
      parseResult,
      sourceDescription,
      existingDereferenceResult.api,
      retrievalURI,
    );
    return parseResult;
  }

  // check if source description was already parsed (e.g., during parse phase with sourceDescriptions: true)
  const existingParseResult = sourceDescription.meta.get('parseResult');

  try {
    let sourceDescriptionDereferenced: ParseResultElement;

    if (isParseResultElement(existingParseResult)) {
      // use existing parsed result - just dereference it (no re-fetch/re-parse)
      sourceDescriptionDereferenced = await dereferenceApiDOM(
        existingParseResult,
        mergeOptions(ctx.options, {
          parse: {
            mediaType: 'text/plain', // allow dereference strategy detection via ApiDOM inspection
          },
          resolve: { baseURI: retrievalURI },
          dereference: {
            strategyOpts: {
              // nested documents should dereference all their source descriptions
              // (parent's name filter doesn't apply to nested documents)
              // set at strategy-specific level to override any inherited filters
              [ctx.strategyName]: {
                sourceDescriptions: true,
                sourceDescriptionsDepth: ctx.currentDepth + 1,
                sourceDescriptionsAncestors: ctx.ancestors,
                sourceDescriptionsDereferenced: ctx.dereferenced,
              },
            },
          },
        }),
      );
    } else {
      // no existing parse result - fetch, parse, and dereference
      sourceDescriptionDereferenced = await dereference(
        retrievalURI,
        mergeOptions(ctx.options, {
          parse: {
            mediaType: 'text/plain', // allow parser plugin detection
          },
          dereference: {
            strategyOpts: {
              // nested documents should dereference all their source descriptions
              // (parent's name filter doesn't apply to nested documents)
              // set at strategy-specific level to override any inherited filters
              [ctx.strategyName]: {
                sourceDescriptions: true,
                sourceDescriptionsDepth: ctx.currentDepth + 1,
                sourceDescriptionsAncestors: ctx.ancestors,
                sourceDescriptionsDereferenced: ctx.dereferenced,
              },
            },
          },
        }),
      );
    }

    // merge dereferenced result into our parse result
    for (const item of sourceDescriptionDereferenced) {
      parseResult.push(item);
    }
  } catch (error: unknown) {
    // create error annotation instead of failing entire dereference
    const message = error instanceof Error ? error.message : String(error);
    const annotation = new AnnotationElement(
      `Error dereferencing source description "${retrievalURI}": ${message}`,
    );
    annotation.classes.push('error');
    parseResult.push(annotation);
    return parseResult;
  }

  // register dereferenced document (by retrieval URI and by identity) for later references to it
  const { api: sourceDescriptionAPI } = parseResult;
  ctx.dereferenced.set(retrievalURI, parseResult);
  ctx.dereferenced.set(resolveArazzo$selfField(retrievalURI, sourceDescriptionAPI), parseResult);

  validateSourceDescriptionAPI(parseResult, sourceDescription, sourceDescriptionAPI, retrievalURI);

  return parseResult;
}

/**
 * Dereferences source descriptions from an Arazzo document.
 *
 * Each source description result is attached to its corresponding
 * SourceDescriptionElement's meta as 'parseResult' for easy access,
 * regardless of success or failure. On failure, the ParseResultElement
 * contains annotations explaining what went wrong.
 *
 * A document referenced from more than one place is dereferenced only once.
 * Every later source description referencing it gets its own result carrying
 * an 'info' annotation and a 'parseResult' meta pointing at the result where
 * the document was dereferenced; that result is also what gets attached to the
 * SourceDescriptionElement's meta. A document referencing one of its ancestors
 * forms a cycle and is skipped with a 'warning' annotation instead.
 *
 * @param parseResult - ParseResult containing a parsed (optionally dereferenced) Arazzo specification
 * @param parseResultRetrievalURI - URI from which the parseResult was retrieved
 * @param options - Full ReferenceOptions. Pass `sourceDescriptions` as an array of names
 *   in `dereference.strategyOpts` to filter which source descriptions to process.
 * @param strategyName - Strategy name for options lookup (defaults to 'arazzo-1')
 * @returns Array of ParseResultElements. Returns one ParseResultElement per source description
 *   (each with class 'source-description' and metadata: name, type, retrievalURI).
 *   May return early with a single-element array containing a warning annotation when:
 *   - The API is not an Arazzo specification
 *   - The sourceDescriptions field is missing or not an array
 *   - Maximum dereference depth is exceeded (error annotation)
 *   Returns an empty array when no source description names match the filter.
 *
 * @example
 * ```typescript
 * import { toValue } from '@speclynx/apidom-core';
 *
 * // Dereference all source descriptions
 * await dereferenceSourceDescriptions(parseResult, uri, options);
 *
 * // Filter by name
 * await dereferenceSourceDescriptions(parseResult, uri, mergeOptions(options, {
 *   dereference: { strategyOpts: { sourceDescriptions: ['petStore'] } },
 * }));
 *
 * // Access dereferenced document from source description element
 * const sourceDesc = parseResult.api.sourceDescriptions.get(0);
 * const dereferencedDoc = sourceDesc.meta.get('parseResult');
 * const retrievalURI = toValue(dereferencedDoc.meta.get('retrievalURI'));
 * ```
 *
 * @public
 */
export async function dereferenceSourceDescriptions(
  parseResult: ParseResultElement,
  parseResultRetrievalURI: string,
  options: ReferenceOptions,
  strategyName: string = 'arazzo-1',
): Promise<ParseResultElement[]> {
  const retrievalURI = url.sanitize(url.stripHash(parseResultRetrievalURI));
  const results: ParseResultElement[] = [];

  // get API from dereferenced parse result
  const { api } = parseResult;

  /**
   * Validate prerequisites for dereferencing source descriptions.
   * Return warning annotations if validation fails.
   */
  if (!isArazzoSpecification1Element(api)) {
    const annotation = new AnnotationElement(
      'Cannot dereference source descriptions: API is not an Arazzo specification',
    );
    annotation.classes.push('warning');
    return [new ParseResultElement([annotation])];
  }
  if (!isArrayElement(api.sourceDescriptions)) {
    const annotation = new AnnotationElement(
      'Cannot dereference source descriptions: sourceDescriptions field is missing or not an array',
    );
    annotation.classes.push('warning');
    return [new ParseResultElement([annotation])];
  }

  // user config: strategy-specific options take precedence over global strategyOpts
  const maxDepth =
    options?.dereference?.strategyOpts?.[strategyName]?.sourceDescriptionsMaxDepth ??
    options?.dereference?.strategyOpts?.sourceDescriptionsMaxDepth ??
    +Infinity;

  // recursion state comes from strategy-specific options
  const sharedOpts = options?.dereference?.strategyOpts?.[strategyName] ?? {};
  const currentDepth = sharedOpts.sourceDescriptionsDepth ?? 0;
  const ancestors: string[] = sharedOpts.sourceDescriptionsAncestors ?? [];
  const dereferenced: Map<string, ParseResultElement> =
    sharedOpts.sourceDescriptionsDereferenced ?? new Map();

  if (currentDepth >= maxDepth) {
    const annotation = new AnnotationElement(
      `Maximum dereference depth of ${maxDepth} has been exceeded by file "${retrievalURI}"`,
    );
    annotation.classes.push('error');
    const parseResult = new ParseResultElement([annotation]);
    parseResult.classes.push('source-description');
    return [parseResult];
  }

  // base URI for resolving source description URLs honors Arazzo `$self` field
  const baseURI = resolveArazzo$selfField(retrievalURI, api);

  const ctx: DereferenceSourceDescriptionContext = {
    baseURI,
    options,
    strategyName,
    currentDepth,
    ancestors,
    dereferenced,
  };

  // determine which source descriptions to dereference (array filters by name)
  const sourceDescriptionsOption =
    options?.dereference?.strategyOpts?.[strategyName]?.sourceDescriptions ??
    options?.dereference?.strategyOpts?.sourceDescriptions;

  const sourceDescriptions = Array.isArray(sourceDescriptionsOption)
    ? api.sourceDescriptions.filter((sd) => {
        if (!isSourceDescriptionElement(sd)) return false;
        const name = toValue(sd.name);
        return typeof name === 'string' && sourceDescriptionsOption.includes(name);
      })
    : api.sourceDescriptions;

  // current file is an ancestor (by retrieval URI and by identity) of everything dereferenced below
  ancestors.push(retrievalURI, baseURI);
  try {
    // process sequentially to ensure proper cycle detection with shared ancestors
    for (const sourceDescription of sourceDescriptions) {
      const sourceDescriptionDereferenceResult = await dereferenceSourceDescription(
        sourceDescription,
        ctx,
      );
      // always attach result (even on failure - contains annotations);
      // a shared document attaches the result where it was dereferenced
      sourceDescription.meta.set(
        'parseResult',
        sourceDescriptionDereferenceResult.meta.get('parseResult') ??
          sourceDescriptionDereferenceResult,
      );
      results.push(sourceDescriptionDereferenceResult);
    }
  } finally {
    ancestors.splice(-2, 2);
  }

  return results;
}
