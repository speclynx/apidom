import { ParseResultElement, AnnotationElement, isStringElement } from '@speclynx/apidom-datamodel';
import { isOverlay1Element } from '@speclynx/apidom-ns-overlay-1';
import { toValue } from '@speclynx/apidom-core';

import File from '../../../File.ts';
import * as url from '../../../util/url.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { merge as mergeOptions } from '../../../options/util.ts';
import parse from '../../index.ts';

/**
 * Parses the `extends` target document from an Overlay document's ParseResult.
 *
 * The parsed extends document is pushed directly into the overlay's ParseResult
 * and always attached to the extends element's meta as 'parseResult',
 * regardless of success or failure.
 *
 * @param parseResult - ParseResult containing an Overlay specification
 * @param parseResultRetrievalURI - URI from which the parseResult was retrieved
 * @param options - Full ReferenceOptions
 *
 * @public
 */
export async function parseExtends(
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

  const extendsParseResult = new ParseResultElement();
  extendsParseResult.classes.push('extends');
  extendsParseResult.setMetaProperty('retrievalURI', retrievalURI);

  try {
    const targetParseResult = await parse(
      retrievalURI,
      mergeOptions(options, {
        parse: {
          mediaType: 'text/plain', // force auto-detection
        },
      }),
    );
    // merge parsed result into our wrapper
    for (const item of targetParseResult) {
      extendsParseResult.push(item);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const annotation = new AnnotationElement(
      `Error parsing extends target "${retrievalURI}": ${message}`,
    );
    annotation.classes.push('error');
    extendsParseResult.push(annotation);
  }

  // always attach result to extends element meta (even on failure - contains annotations)
  extendsElement.meta.set('parseResult', extendsParseResult);
  parseResult.push(extendsParseResult);
}
