import { ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { isOverlay1Element } from '@speclynx/apidom-ns-overlay-1';
import {
  parse,
  mergeOptions,
  url,
  type ApiDOMReferenceOptions as ReferenceOptions,
} from '@speclynx/apidom-reference';

import { applyOverlay as applyOverlayApiDOM, type ApplyOverlayOptions } from './apidom.ts';
import OverlayError from '../../errors/OverlayError.ts';

export type { ApplyOverlayOptions };

const defaultReferenceOptions = {
  parse: {
    parserOpts: {
      strict: false,
      style: true,
      'overlay-json-1': {
        sourceMap: true,
        style: true,
        extends: true,
      },
      'overlay-yaml-1': {
        sourceMap: true,
        style: true,
        extends: true,
      },
    },
  },
  resolve: {
    resolverOpts: {
      fileAllowList: ['*'],
    },
  },
};

/**
 * @public
 */
export const defaultOptions: ApplyOverlayOptions = {
  immutable: false,
  strict: false,
  reference: defaultReferenceOptions,
};

/**
 * Applies an overlay document from a file/URL to its target document.
 *
 * Parses the overlay, resolves the target from `targetURI` or the overlay's
 * `extends` field, and applies all overlay actions. Both documents are parsed with
 * style preservation for round-trip fidelity, so values added by the overlay are
 * written as they're written in the overlay when both are in the same format.
 * Anchors, aliases and comments in the overlay aren't written to the target.
 *
 * @param overlayURI - URI to the overlay document (file path or URL)
 * @param targetURI - URI to the target document; if omitted, uses the overlay's `extends` field
 * @param options - overlay apply options; reference options live under `options.reference`
 * @returns ParseResultElement with the modified target document
 *
 * @public
 */
const applyOverlay = async (
  overlayURI: string,
  targetURI?: string,
  options: ApplyOverlayOptions = defaultOptions,
): Promise<ParseResultElement> => {
  const mergedRefOptions = mergeOptions(
    defaultReferenceOptions as unknown as ReferenceOptions,
    (options.reference ?? {}) as Record<string, unknown>,
  );

  // parse the overlay document along with document attached to `extends` field (if present)
  const overlayParseResult = await parse(overlayURI, mergedRefOptions);
  const overlayElement = overlayParseResult.api;

  if (!isOverlay1Element(overlayElement)) {
    throw new OverlayError(`Failed to parse overlay document "${overlayURI}"`);
  }

  let targetParseResult;
  if (targetURI) {
    targetParseResult = await parse(targetURI, mergedRefOptions);
  } else {
    const extendsElement = overlayElement.get('extends');
    targetParseResult = extendsElement?.meta?.get('parseResult') as ParseResultElement;
  }

  if (!isParseResultElement(targetParseResult)) {
    throw new OverlayError(
      'No target specified: provide targetURI or set the "extends" field in the overlay document',
    );
  }

  // apply overlay actions to the target (mutable by default: targetParseResult with result replaced)
  return applyOverlayApiDOM(overlayParseResult, targetParseResult, {
    ...options,
    immutable: options.immutable ?? defaultOptions.immutable,
    reference: {
      ...options.reference,
      // same normalization `parse` applies, so reference errors report the parsed document's URI
      resolve: { ...options.reference?.resolve, baseURI: url.sanitize(url.stripHash(overlayURI)) },
    },
  });
};

export default applyOverlay;
