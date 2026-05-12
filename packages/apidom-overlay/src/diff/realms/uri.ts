import { Element } from '@speclynx/apidom-datamodel';
import { Overlay1Element } from '@speclynx/apidom-ns-overlay-1';
import {
  parse,
  mergeOptions,
  type ApiDOMReferenceOptions as ReferenceOptions,
} from '@speclynx/apidom-reference';
import type { PartialDeep } from 'type-fest';

import { diff as diffApiDOM, type DiffOptions } from './apidom.ts';
import OverlayError from '../../errors/OverlayError.ts';

/**
 * @public
 */
export interface DiffOverlayOptions extends DiffOptions {
  readonly reference?: PartialDeep<ReferenceOptions>;
}

// intentionally omits overlay-json-1/overlay-yaml-1 parser opts present in apply/realms/uri.ts
// because diff inputs are regular API documents, not overlay documents
const defaultReferenceOptions = {
  parse: {
    parserOpts: {
      strict: false,
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
export const defaultOptions: DiffOverlayOptions = {
  reference: defaultReferenceOptions,
};

/**
 * Computes the diff between two API documents identified by URIs and returns
 * an {@link Overlay1Element} that, when applied to the left document, yields the right.
 *
 * When `options.extends` is not provided, it is automatically set to `leftURI`
 * so the generated overlay can be applied back to the original document.
 *
 * @param leftURI - URI to the base (source) document
 * @param rightURI - URI to the target (changed) document
 * @param options - diff options; reference options live under `options.reference`
 * @returns Overlay1Element representing the diff
 *
 * @public
 */
const diff = async (
  leftURI: string,
  rightURI: string,
  options: DiffOverlayOptions = defaultOptions,
): Promise<Overlay1Element> => {
  const mergedRefOptions = mergeOptions(
    defaultReferenceOptions as unknown as ReferenceOptions,
    (options.reference ?? {}) as Record<string, unknown>,
  );

  const [leftParseResult, rightParseResult] = await Promise.all([
    parse(leftURI, mergedRefOptions),
    parse(rightURI, mergedRefOptions),
  ]);

  const leftElement = leftParseResult.api;
  const rightElement = rightParseResult.api;

  if (leftElement == null) {
    throw new OverlayError(`Failed to parse document "${leftURI}"`);
  }
  if (rightElement == null) {
    throw new OverlayError(`Failed to parse document "${rightURI}"`);
  }

  const diffOptions: DiffOptions = {
    ...options,
    extends: options.extends ?? leftURI,
  };

  return diffApiDOM(leftElement as Element, rightElement as Element, diffOptions);
};

export default diff;
