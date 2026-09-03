import {
  Element,
  ParseResultElement,
  AnnotationElement,
  isArrayElement,
  isStringElement,
} from '@speclynx/apidom-datamodel';
import {
  isArazzoSpecification1Element,
  isSourceDescriptionElement,
} from '@speclynx/apidom-ns-arazzo-1';
import { toValue } from '@speclynx/apidom-core';

import File from '../../../File.ts';
import * as url from '../../../util/url.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { merge as mergeOptions } from '../../../options/util.ts';
import parse from '../../index.ts';
import {
  arazzoDocumentURIs,
  resolveArazzo$selfField,
  validateSourceDescriptionAPI,
} from '../../../dereference/strategies/arazzo-1/util.ts';

// shared key for recursion state (works across JSON/YAML parsers)
const ARAZZO_RECURSION_KEY = 'arazzo-1';

interface ParseSourceDescriptionContext {
  baseURI: string;
  options: ReferenceOptions;
  currentDepth: number;
  // URIs of the documents currently being parsed, from the root down to the current one
  ancestors: string[];
  // source description results of documents parsed so far, keyed by their URIs
  parsed: Map<string, ParseResultElement>;
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

  // normalize URI for consistent cycle detection and cache key matching
  const retrievalURI = url.sanitize(url.stripHash(url.resolve(ctx.baseURI, sourceDescriptionURI)));
  parseResult.setMetaProperty('retrievalURI', retrievalURI);

  // skip if the document is still being parsed higher up the chain (cycle detection)
  if (ctx.ancestors.includes(retrievalURI)) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" has already been visited. Skipping to prevent cycle`,
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return parseResult;
  }

  // a document reached again through a different path is a shared dependency, not a cycle;
  // point at the result where it was parsed instead of parsing it again
  const sharedParseResult = ctx.parsed.get(retrievalURI);
  if (sharedParseResult !== undefined) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" has already been parsed. Reusing existing parse result`,
    );
    annotation.classes.push('info');
    parseResult.push(annotation);
    parseResult.meta.set('parseResult', sharedParseResult);
    validateSourceDescriptionAPI(
      parseResult,
      sourceDescription,
      sharedParseResult.api,
      retrievalURI,
      'parsed',
    );
    return parseResult;
  }

  try {
    const sourceDescriptionParseResult = await parse(
      retrievalURI,
      mergeOptions(ctx.options, {
        parse: {
          mediaType: 'text/plain', // allow parser plugin detection
          parserOpts: {
            // nested documents should parse all their source descriptions
            // (parent's name filter doesn't apply to nested documents)
            sourceDescriptions: true,
            [ARAZZO_RECURSION_KEY]: {
              sourceDescriptionsDepth: ctx.currentDepth + 1,
              sourceDescriptionsAncestors: ctx.ancestors,
              sourceDescriptionsParsed: ctx.parsed,
            },
          },
        },
      }),
    );
    // merge parsed result into our parse result
    for (const item of sourceDescriptionParseResult) {
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

  // register parsed document for later references to it
  const { api: sourceDescriptionAPI } = parseResult;
  for (const documentURI of arazzoDocumentURIs(retrievalURI, sourceDescriptionAPI)) {
    ctx.parsed.set(documentURI, parseResult);
  }

  validateSourceDescriptionAPI(
    parseResult,
    sourceDescription,
    sourceDescriptionAPI,
    retrievalURI,
    'parsed',
  );

  return parseResult;
}

/**
 * Parses source descriptions from an Arazzo document's ParseResult.
 *
 * Each source description result is attached to its corresponding
 * SourceDescriptionElement's meta as 'parseResult' for easy access,
 * regardless of success or failure. On failure, the ParseResultElement
 * contains annotations explaining what went wrong.
 *
 * A document referenced from more than one place is parsed only once.
 * Every later source description referencing it gets its own result carrying
 * an 'info' annotation and a 'parseResult' meta pointing at the result where
 * the document was parsed; that result is also what gets attached to the
 * SourceDescriptionElement's meta. A document referencing one of its ancestors
 * forms a cycle and is skipped with a 'warning' annotation instead.
 *
 * @param parseResult - ParseResult containing an Arazzo specification
 * @param parseResultRetrievalURI - URI from which the parseResult was retrieved
 * @param options - Full ReferenceOptions. Pass `sourceDescriptions` as an array of names
 *   in `parse.parserOpts` to filter which source descriptions to process.
 * @param parserName - Parser name for options lookup (defaults to 'arazzo-json-1')
 * @returns Array of ParseResultElements. Returns one ParseResultElement per source description
 *   (each with class 'source-description' and metadata: name, type, retrievalURI).
 *   May return early with a single-element array containing a warning annotation when:
 *   - The API is not an Arazzo specification
 *   - The sourceDescriptions field is missing or not an array
 *   - Maximum parse depth is exceeded (error annotation)
 *   Returns an empty array when no source description names match the filter.
 *
 * @example
 * ```typescript
 * import { toValue } from '@speclynx/apidom-core';
 * import { options, mergeOptions } from '@speclynx/apidom-reference';
 * import { parseSourceDescriptions } from '@speclynx/apidom-reference/parse/parsers/arazzo-json-1';
 *
 * // Parse all source descriptions
 * const results = await parseSourceDescriptions(parseResult, uri, options);
 *
 * // Filter by name
 * const filtered = await parseSourceDescriptions(parseResult, uri, mergeOptions(options, {
 *   parse: { parserOpts: { sourceDescriptions: ['petStore'] } }
 * }));
 *
 * // Access parsed document from source description element
 * const sourceDesc = parseResult.api.sourceDescriptions.get(0);
 * const parsedDoc = sourceDesc.meta.get('parseResult');
 * const retrievalURI = toValue(parsedDoc.meta.get('retrievalURI'));
 * ```
 *
 * @public
 */
export async function parseSourceDescriptions(
  parseResult: ParseResultElement,
  parseResultRetrievalURI: string,
  options: ReferenceOptions,
  parserName: string = 'arazzo-json-1',
): Promise<ParseResultElement[]> {
  const { api } = parseResult;
  const file = new File({ uri: url.sanitize(url.stripHash(parseResultRetrievalURI)) });
  const results: ParseResultElement[] = [];

  /**
   * Validate prerequisites for parsing source descriptions.
   * Return warning annotations if validation fails.
   */
  if (!isArazzoSpecification1Element(api)) {
    const annotation = new AnnotationElement(
      'Cannot parse source descriptions: API is not an Arazzo specification',
    );
    annotation.classes.push('warning');
    return [new ParseResultElement([annotation])];
  }
  if (!isArrayElement(api.sourceDescriptions)) {
    const annotation = new AnnotationElement(
      'Cannot parse source descriptions: sourceDescriptions field is missing or not an array',
    );
    annotation.classes.push('warning');
    return [new ParseResultElement([annotation])];
  }

  // user config: parser-specific options take precedence over global parserOpts
  const maxDepth =
    options?.parse?.parserOpts?.[parserName]?.sourceDescriptionsMaxDepth ??
    options?.parse?.parserOpts?.sourceDescriptionsMaxDepth ??
    +Infinity;

  // recursion state comes from shared key (works across JSON/YAML)
  const sharedOpts = options?.parse?.parserOpts?.[ARAZZO_RECURSION_KEY] ?? {};
  const currentDepth = sharedOpts.sourceDescriptionsDepth ?? 0;
  const parsed: Map<string, ParseResultElement> = sharedOpts.sourceDescriptionsParsed ?? new Map();
  // current file is an ancestor of everything parsed below
  const ancestors: string[] = [
    ...(sharedOpts.sourceDescriptionsAncestors ?? []),
    ...arazzoDocumentURIs(file.uri, api),
  ];

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
    // base URI for resolving source description URLs honors Arazzo `$self` field
    baseURI: resolveArazzo$selfField(file.uri, api),
    options,
    currentDepth,
    ancestors,
    parsed,
  };

  // determine which source descriptions to parse (array filters by name)
  const sourceDescriptionsOption =
    options?.parse?.parserOpts?.[parserName]?.sourceDescriptions ??
    options?.parse?.parserOpts?.sourceDescriptions;

  const sourceDescriptions = Array.isArray(sourceDescriptionsOption)
    ? api.sourceDescriptions.filter((sd) => {
        if (!isSourceDescriptionElement(sd)) return false;
        const name = toValue(sd.name);
        return typeof name === 'string' && sourceDescriptionsOption.includes(name);
      })
    : api.sourceDescriptions;

  // process sequentially to ensure proper cycle detection with shared state
  for (const sourceDescription of sourceDescriptions) {
    const sourceDescriptionParseResult = await parseSourceDescription(sourceDescription, ctx);
    // always attach result (even on failure - contains annotations);
    // a shared document attaches the result where it was parsed
    sourceDescription.meta.set(
      'parseResult',
      sourceDescriptionParseResult.meta.get('parseResult') ?? sourceDescriptionParseResult,
    );
    results.push(sourceDescriptionParseResult);
  }

  return results;
}
