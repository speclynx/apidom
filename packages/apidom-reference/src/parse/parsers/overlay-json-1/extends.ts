import { ParseResultElement, AnnotationElement, isStringElement } from '@speclynx/apidom-datamodel';
import { isOverlay1Element } from '@speclynx/apidom-ns-overlay-1';
import { toValue } from '@speclynx/apidom-core';

import File from '../../../File.ts';
import * as url from '../../../util/url.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { merge as mergeOptions } from '../../../options/util.ts';
import parse from '../../index.ts';

// shared key for recursion state (works across JSON/YAML parsers)
const OVERLAY_RECURSION_KEY = 'overlay-1';

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

  // Overlay 1.2.0: `$self` (itself resolved against the retrieval URI) is the base URI
  const selfElement = api.get('$self');
  const baseURI = isStringElement(selfElement)
    ? url.resolve(file.uri, toValue(selfElement) as string)
    : file.uri;
  const extendsURI = toValue(extendsElement) as string;
  const retrievalURI = url.sanitize(url.stripHash(url.resolve(baseURI, extendsURI)));

  const extendsParseResult = new ParseResultElement();
  extendsParseResult.classes.push('extends');
  extendsParseResult.setMetaProperty('retrievalURI', retrievalURI);

  // URIs of the Overlays currently being parsed, from the root down to the current one
  const ancestors: string[] = [
    ...(options?.parse?.parserOpts?.[OVERLAY_RECURSION_KEY]?.extendsAncestors ?? []),
    file.uri,
  ];

  // skip if the target is still being parsed higher up the chain (cycle detection)
  if (ancestors.includes(retrievalURI)) {
    const annotation = new AnnotationElement(
      `Extends target "${retrievalURI}" has already been visited. Skipping to prevent cycle`,
    );
    annotation.classes.push('warning');
    extendsParseResult.push(annotation);
  } else {
    try {
      const targetParseResult = await parse(
        retrievalURI,
        mergeOptions(options, {
          parse: {
            mediaType: 'text/plain', // force auto-detection
            parserOpts: {
              [OVERLAY_RECURSION_KEY]: { extendsAncestors: ancestors },
            },
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
  }

  // always attach result to extends element meta (even on failure - contains annotations)
  extendsElement.meta.set('parseResult', extendsParseResult);
  parseResult.push(extendsParseResult);
}
