import { ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { isOverlay1Element } from '@speclynx/apidom-ns-overlay-1';
import {
  parse,
  mergeOptions,
  type ApiDOMReferenceOptions as ReferenceOptions,
} from '@speclynx/apidom-reference';

import { applyOverlayApiDOM, type ApplyOptions } from './apply.ts';
import OverlayError from './errors/OverlayError.ts';

/**
 * @public
 */
export interface ApplyOverlayOptions extends Partial<ReferenceOptions>, ApplyOptions {}

const defaultOptions = {
  parse: {
    parserOpts: {
      strict: false,
      style: true,
      'overlay-json-1': {
        sourceMap: true,
        style: false,
        extends: true,
      },
      'overlay-yaml-1': {
        sourceMap: true,
        style: false,
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
 * Applies an overlay document from a file/URL to its target document.
 *
 * Parses the overlay, resolves the target from `targetURI` or the overlay's
 * `extends` field, parses the target with style preservation for round-trip fidelity,
 * and applies all overlay actions.
 *
 * @param overlayURI - URI to the overlay document (file path or URL)
 * @param targetURI - URI to the target document; if omitted, uses the overlay's `extends` field
 * @param options - apidom-reference options + overlay merge options
 * @returns ParseResultElement with the modified target document
 *
 * @public
 */
const applyOverlay = async (
  overlayURI: string,
  targetURI?: string,
  options: ApplyOverlayOptions = { immutable: false, strict: false },
): Promise<ParseResultElement> => {
  const mergedOptions = mergeOptions(defaultOptions as unknown as ReferenceOptions, options);

  // parse the overlay document along with document attached to `extends` field (if present)
  const overlayParseResult = await parse(overlayURI, mergedOptions);
  const overlayElement = overlayParseResult.api;

  if (!isOverlay1Element(overlayElement)) {
    throw new OverlayError(`Failed to parse overlay document "${overlayURI}"`);
  }

  let targetParseResult;
  if (targetURI) {
    const targetOptions = mergeOptions(defaultOptions as unknown as ReferenceOptions, options);
    targetParseResult = await parse(targetURI, targetOptions);
  } else {
    const extendsElement = overlayElement.get('extends');
    targetParseResult = extendsElement?.meta?.get('parseResult') as ParseResultElement;
  }

  if (!isParseResultElement(targetParseResult)) {
    throw new OverlayError(
      'No target specified: provide targetURI or set the "extends" field in the overlay document',
    );
  }

  // apply overlay actions to the target
  const overlayed = applyOverlayApiDOM(overlayParseResult, targetParseResult, options);

  // replace result in existing ParseResultElement to preserve annotations and metadata
  overlayed.classes.push('result');
  targetParseResult.replaceResult(overlayed);
  return targetParseResult;
};

export default applyOverlay;
