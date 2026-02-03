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

import File from '../../../File.ts';
import * as url from '../../../util/url.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import type ParseFn from '../../index.ts';
import { merge as mergeOptions } from '../../../options/util.ts';

// shared key for recursion state (works across JSON/YAML parsers)
const ARAZZO_RECURSION_KEY = 'arazzo-1';

interface ParseSourceDescriptionContext {
  parseFn: typeof ParseFn;
  baseURI: string;
  options: ReferenceOptions;
  currentDepth: number;
  visitedUrls: Set<string>;
}

/**
 * Parses a single source description element.
 * Returns ParseResultElement on success, or undefined if skipped.
 */
async function parseSourceDescription(
  sourceDescription: Element,
  ctx: ParseSourceDescriptionContext,
): Promise<ParseResultElement> {
  const parseResult = new ParseResultElement();

  if (!isSourceDescriptionElement(sourceDescription)) {
    const annotation = new AnnotationElement(
      'Element is not a valid SourceDescriptionElement. Skipping.',
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
      'Source description URL is missing or not a string. Skipping.',
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }

  const retrievalURI = url.resolve(ctx.baseURI, sourceDescriptionURI);

  // skip if already visited (cycle detection)
  if (ctx.visitedUrls.has(retrievalURI)) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" has already been visited. Skipping to prevent cycle.`,
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }
  ctx.visitedUrls.add(retrievalURI);

  try {
    const sdParseResult = await ctx.parseFn(
      retrievalURI,
      mergeOptions(ctx.options, {
        parse: {
          mediaType: 'text/plain', // allow parser plugin detection
          parserOpts: {
            [ARAZZO_RECURSION_KEY]: {
              sourceDescriptionsDepth: ctx.currentDepth + 1,
              sourceDescriptionsVisitedUrls: ctx.visitedUrls,
            },
          },
        },
      }),
    );
    // merge parsed result into our parse result
    for (const item of sdParseResult) {
      parseResult.push(item);
    }
  } catch (error: unknown) {
    // create error annotation instead of failing entire parse
    const message = error instanceof Error ? error.message : String(error);
    const annotation = new AnnotationElement(
      `Error parsing source description "${retrievalURI}": ${message}`,
    );
    annotation.classes.push('error');
    parseResult.push(annotation);
    return parseResult;
  }

  // only allow OpenAPI and Arazzo as source descriptions
  const { api: sourceDescriptionAPI } = parseResult;
  if (
    !isSwaggerElement(sourceDescriptionAPI) &&
    !isOpenApi3_0Element(sourceDescriptionAPI) &&
    !isOpenApi3_1Element(sourceDescriptionAPI) &&
    !isArazzoSpecification1Element(sourceDescriptionAPI)
  ) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" is not an OpenAPI or Arazzo document. Skipping.`,
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
  }

  return parseResult;
}

/**
 * Shared function for parsing source descriptions.
 * Call with `.call(this, ...)` where `this` has `name` and `parseFn` properties.
 * @public
 */
export async function parseSourceDescriptions(
  this: { name: string; parseFn?: typeof ParseFn },
  api: Element | undefined,
  file: File,
  options: ReferenceOptions,
): Promise<ParseResultElement[]> {
  const results: ParseResultElement[] = [];

  /**
   * Validate prerequisites for parsing source descriptions.
   * Return warning annotations if validation fails.
   */
  if (!isArazzoSpecification1Element(api)) {
    const annotation = new AnnotationElement(
      'Cannot parse source descriptions: API is not an Arazzo specification.',
    );
    annotation.classes.push('warning');
    return [new ParseResultElement([annotation])];
  }
  if (!isArrayElement(api.sourceDescriptions)) {
    const annotation = new AnnotationElement(
      'Cannot parse source descriptions: sourceDescriptions field is missing or not an array.',
    );
    annotation.classes.push('warning');
    return [new ParseResultElement([annotation])];
  }
  if (typeof this.parseFn !== 'function') {
    const annotation = new AnnotationElement(
      'Source descriptions found but parseFn is not configured. Skipping source description parsing.',
    );
    annotation.classes.push('error');
    return [new ParseResultElement([annotation])];
  }

  // user config: parser-specific options take precedence over global parserOpts
  const maxDepth =
    options?.parse?.parserOpts?.[this.name]?.sourceDescriptionsMaxDepth ??
    options?.parse?.parserOpts?.sourceDescriptionsMaxDepth ??
    +Infinity;

  // recursion state comes from shared key (works across JSON/YAML)
  const sharedOpts = options?.parse?.parserOpts?.[ARAZZO_RECURSION_KEY] ?? {};
  const currentDepth = sharedOpts.sourceDescriptionsDepth ?? 0;
  const visitedUrls: Set<string> = sharedOpts.sourceDescriptionsVisitedUrls ?? new Set();

  // add current file to visited URLs to prevent cycles
  visitedUrls.add(file.uri);

  if (currentDepth >= maxDepth) {
    const annotation = new AnnotationElement(
      `Maximum parse depth of ${maxDepth} has been exceeded by file "${file.uri}"`,
    );
    annotation.classes.push('error');
    const parseResult = new ParseResultElement([annotation]);
    parseResult.classes.push('source-description');
    return [parseResult];
  }

  const ctx: ParseSourceDescriptionContext = {
    parseFn: this.parseFn,
    baseURI: file.uri,
    options,
    currentDepth,
    visitedUrls,
  };

  // determine which source descriptions to parse
  const sourceDescriptionsOption =
    options?.parse?.parserOpts?.[this.name]?.sourceDescriptions ??
    options?.parse?.parserOpts?.sourceDescriptions;

  // handle false or other falsy values - no source descriptions should be parsed
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
    const sourceDescriptionParseResult = await parseSourceDescription(sourceDescription, ctx);
    results.push(sourceDescriptionParseResult);
  }

  return results;
}
