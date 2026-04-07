import {
  ParseResultElement,
  AnnotationElement,
  isStringElement,
  isParseResultElement,
  includesClasses,
} from '@speclynx/apidom-datamodel';
import { isOverlay1Element } from '@speclynx/apidom-ns-overlay-1';
import { toValue } from '@speclynx/apidom-core';

import File from '../../../File.ts';
import * as url from '../../../util/url.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { merge as mergeOptions } from '../../../options/util.ts';
import dereference, { dereferenceApiDOM } from '../../index.ts';

/**
 * Dereferences the `extends` target document from an Overlay document's ParseResult.
 *
 * If the extends element already has a parsed result attached (from the parse phase),
 * it will be dereferenced in place. Otherwise, the target document will be fetched,
 * parsed, and dereferenced.
 *
 * The dereferenced result is pushed into the overlay's ParseResult
 * and always attached to the extends element's meta as 'parseResult',
 * overriding any existing parse result from the parse phase.
 * On failure, the result contains error annotations.
 *
 * @param parseResult - ParseResult containing an Overlay specification
 * @param parseResultRetrievalURI - URI from which the parseResult was retrieved
 * @param options - Full ReferenceOptions
 *
 * @public
 */
export async function dereferenceExtends(
  parseResult: ParseResultElement,
  parseResultRetrievalURI: string,
  options: ReferenceOptions,
): Promise<void> {
  const { api } = parseResult;
  const file = new File({ uri: url.sanitize(url.stripHash(parseResultRetrievalURI)) });

  if (!isOverlay1Element(api)) {
    return;
  }

  const extendsElement = api.get('extends');
  if (!isStringElement(extendsElement)) {
    return;
  }

  const extendsURI = toValue(extendsElement) as string;
  const retrievalURI = url.sanitize(url.stripHash(url.resolve(file.uri, extendsURI)));

  const extendsDereferenceResult = new ParseResultElement();
  extendsDereferenceResult.classes.push('extends');
  extendsDereferenceResult.setMetaProperty('retrievalURI', retrievalURI);

  try {
    let extendsDereferenced: ParseResultElement;

    // check if extends was already parsed (e.g., during parse phase with extends: true)
    const existingParseResult = extendsElement.meta.get('parseResult');

    if (isParseResultElement(existingParseResult)) {
      // use existing parsed result - just dereference it (no re-fetch/re-parse)
      extendsDereferenced = await dereferenceApiDOM(
        existingParseResult,
        mergeOptions(options, {
          parse: {
            mediaType: 'text/plain', // allow dereference strategy detection via ApiDOM inspection
          },
          resolve: { baseURI: retrievalURI },
        }),
      );
    } else {
      // no existing parse result - fetch, parse, and dereference
      extendsDereferenced = await dereference(
        retrievalURI,
        mergeOptions(options, {
          parse: {
            mediaType: 'text/plain', // allow parser plugin detection
          },
        }),
      );
    }

    // merge dereferenced result into our wrapper
    for (const item of extendsDereferenced) {
      extendsDereferenceResult.push(item);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const annotation = new AnnotationElement(
      `Error dereferencing extends target "${retrievalURI}": ${message}`,
    );
    annotation.classes.push('error');
    extendsDereferenceResult.push(annotation);
  }

  // always attach result to extends element meta (even on failure - contains annotations)
  extendsElement.meta.set('parseResult', extendsDereferenceResult);

  // drop any existing parse-phase extends results before pushing
  const cleaned = parseResult.reject(
    (item) => isParseResultElement(item) && includesClasses(item, ['extends']),
  );
  parseResult.content = cleaned.content;
  parseResult.push(extendsDereferenceResult);
}
