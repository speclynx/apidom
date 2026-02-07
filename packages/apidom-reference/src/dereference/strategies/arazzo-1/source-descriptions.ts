import {
  Element,
  ParseResultElement,
  AnnotationElement,
  isArrayElement,
  isStringElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import {
  isArazzoSpecification1Element,
  isSourceDescriptionElement,
} from '@speclynx/apidom-ns-arazzo-1';
import { isSwaggerElement } from '@speclynx/apidom-ns-openapi-2';
import { isOpenApi3_0Element } from '@speclynx/apidom-ns-openapi-3-0';
import { isOpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';
import { toValue } from '@speclynx/apidom-core';

import * as url from '../../../util/url.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { merge as mergeOptions } from '../../../options/util.ts';
import dereference from '../../index.ts';

// shared key for recursion state (works across JSON/YAML documents)
const ARAZZO_DEREFERENCE_RECURSION_KEY = 'arazzo-1';

interface DereferenceSourceDescriptionContext {
  baseURI: string;
  options: ReferenceOptions;
  currentDepth: number;
  visitedUrls: Set<string>;
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
    parseResult.setMetaProperty('name', cloneDeep(sourceDescription.name));
  if (isStringElement(sourceDescription.type))
    parseResult.setMetaProperty('type', cloneDeep(sourceDescription.type));

  const sourceDescriptionURI = toValue(sourceDescription.url);
  if (typeof sourceDescriptionURI !== 'string') {
    const annotation = new AnnotationElement(
      'Source description URL is missing or not a string. Skipping',
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }

  const retrievalURI = url.resolve(ctx.baseURI, sourceDescriptionURI);

  // skip if already visited (cycle detection)
  if (ctx.visitedUrls.has(retrievalURI)) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" has already been visited. Skipping to prevent cycle`,
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }
  ctx.visitedUrls.add(retrievalURI);

  try {
    const sourceDescriptionDereferenced = await dereference(
      retrievalURI,
      mergeOptions(ctx.options, {
        parse: {
          mediaType: 'text/plain', // allow parser plugin detection
        },
        dereference: {
          strategyOpts: {
            [ARAZZO_DEREFERENCE_RECURSION_KEY]: {
              sourceDescriptionsDepth: ctx.currentDepth + 1,
              sourceDescriptionsVisitedUrls: ctx.visitedUrls,
            },
          },
        },
      }),
    );
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

  // only allow OpenAPI and Arazzo as source descriptions
  const { api: sourceDescriptionAPI } = parseResult;
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
    return parseResult;
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
 * @param parseResult - ParseResult containing a parsed (optionally dereferenced) Arazzo specification
 * @param parseResultRetrievalURI - URI from which the parseResult was retrieved
 * @param options - Full ReferenceOptions (caller responsibility to construct)
 * @param strategyName - Strategy name for options lookup (defaults to 'arazzo-1')
 * @returns Array of ParseResultElements. On success, returns one ParseResultElement per
 *   source description (each with class 'source-description' and name/type metadata).
 *   May return early with a single-element array containing a warning annotation when:
 *   - The API is not an Arazzo specification
 *   - The sourceDescriptions field is missing or not an array
 *   - Maximum dereference depth is exceeded (error annotation)
 *   Returns an empty array when sourceDescriptions option is disabled or no names match.
 *
 * @example
 * ```typescript
 * // Access dereferenced document from source description element
 * const sourceDesc = parseResult.api.sourceDescriptions.get(0);
 * const dereferencedDoc = sourceDesc.meta.get('parseResult');
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
  const baseURI = url.sanitize(url.stripHash(parseResultRetrievalURI));
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

  // recursion state comes from shared key (works across JSON/YAML)
  const sharedOpts = options?.dereference?.strategyOpts?.[ARAZZO_DEREFERENCE_RECURSION_KEY] ?? {};
  const currentDepth = sharedOpts.sourceDescriptionsDepth ?? 0;
  const visitedUrls: Set<string> = sharedOpts.sourceDescriptionsVisitedUrls ?? new Set();

  // add current file to visited URLs to prevent cycles
  visitedUrls.add(baseURI);

  if (currentDepth >= maxDepth) {
    const annotation = new AnnotationElement(
      `Maximum dereference depth of ${maxDepth} has been exceeded by file "${baseURI}"`,
    );
    annotation.classes.push('error');
    const parseResult = new ParseResultElement([annotation]);
    parseResult.classes.push('source-description');
    return [parseResult];
  }

  const ctx: DereferenceSourceDescriptionContext = {
    baseURI,
    options,
    currentDepth,
    visitedUrls,
  };

  // determine which source descriptions to dereference
  const sourceDescriptionsOption =
    options?.dereference?.strategyOpts?.[strategyName]?.sourceDescriptions ??
    options?.dereference?.strategyOpts?.sourceDescriptions;

  // handle false or other falsy values - no source descriptions should be dereferenced
  if (!sourceDescriptionsOption) {
    return results;
  }

  const sourceDescriptions = Array.isArray(sourceDescriptionsOption)
    ? api.sourceDescriptions.filter((sd) => {
        if (!isSourceDescriptionElement(sd)) return false;
        const name = toValue(sd.name);
        return typeof name === 'string' && sourceDescriptionsOption.includes(name);
      })
    : api.sourceDescriptions;

  // process sequentially to ensure proper cycle detection with shared visitedUrls
  for (const sourceDescription of sourceDescriptions) {
    const sourceDescriptionDereferenceResult = await dereferenceSourceDescription(
      sourceDescription,
      ctx,
    );
    // always attach result (even on failure - contains annotations)
    sourceDescription.meta.set('parseResult', sourceDescriptionDereferenceResult);
    results.push(sourceDescriptionDereferenceResult);
  }

  return results;
}
