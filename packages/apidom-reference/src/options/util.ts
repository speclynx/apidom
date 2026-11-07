import { mergeDeepRight, lens, path, assocPath, over } from 'ramda';
import { isEmptyString } from 'ramda-adjunct';

import { cwd, getProtocol, isFileSystemPath, fromFileSystemPath } from '../util/url.ts';
import type { ReferenceOptions } from './index.ts';

/**
 * Algorithm for deep merging options.
 */

const baseURILens = lens(path(['resolve', 'baseURI']), assocPath(['resolve', 'baseURI']));
// in Node cwd() is a raw file system path; encode it, so that it reads as a URI
// (in browsers it is the page URL, which may be an already encoded file:// URL)
const cwdURI = () => {
  const dir = cwd();
  return isFileSystemPath(dir) && getProtocol(dir) !== 'file' ? fromFileSystemPath(dir) : dir;
};
const baseURIDefault = (baseURI: string) => (isEmptyString(baseURI) ? cwdURI() : baseURI);

/**
 * @public
 */

export const merge = (lObj: ReferenceOptions, rObj: Record<string, any>): ReferenceOptions => {
  const withoutDefaults = mergeDeepRight(lObj, rObj);
  // @ts-ignore
  return over(baseURILens, baseURIDefault, withoutDefaults);
};
