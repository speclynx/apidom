import { isEmpty, propEq } from 'ramda';
import {
  Element,
  isParseResultElement,
  ParseResultElement,
  cloneShallow,
} from '@speclynx/apidom-datamodel';

import File from '../File.ts';
import * as plugins from '../util/plugins.ts';
import UnmatchedDereferenceStrategyError from '../errors/UnmatchedDereferenceStrategyError.ts';
import DereferenceError from '../errors/DereferenceError.ts';
import UnresolvableReferenceError from '../errors/UnresolvableReferenceError.ts';
import parse from '../parse/index.ts';
import { merge as mergeOptions } from '../options/util.ts';
import * as url from '../util/url.ts';
import type { ReferenceOptions } from '../options/index.ts';

/**
 * Dereferences ApiDOM with all its external references.
 */
export const dereferenceApiDOM = async <T extends Element>(
  element: T,
  options: ReferenceOptions,
): Promise<T> => {
  // @ts-ignore
  let parseResult: ParseResultElement = element;
  let surrogateWrapping = false;

  // wrap element into parse result
  if (!isParseResultElement(element)) {
    const elementClone = cloneShallow(element);
    elementClone.classes.push('result');
    parseResult = new ParseResultElement([elementClone]);
    surrogateWrapping = true;
  }

  // strategies look up same-document references by a resolved, hence normalized, URI
  const file = new File({
    uri: url.normalize(options.resolve.baseURI),
    parseResult,
    mediaType: options.parse.mediaType,
  });

  const dereferenceStrategies = await plugins.filter(
    'canDereference',
    [file, options],
    options.dereference.strategies,
  );

  // we couldn't find any dereference strategy for this File
  if (isEmpty(dereferenceStrategies)) {
    throw new UnmatchedDereferenceStrategyError(
      `Could not find a dereference strategy that can dereference the file "${file.uri}"`,
    );
  }

  try {
    const { result } = await plugins.run('dereference', [file, options], dereferenceStrategies);
    // unwrap the element from ParseResult assuming first element is the actual result
    return surrogateWrapping ? result.get(0) : result;
  } catch (error: any) {
    if (error instanceof UnresolvableReferenceError) {
      throw error;
    }
    throw new DereferenceError(`Error while dereferencing file "${file.uri}"`, { cause: error });
  }
};

/**
 * Dereferences a file with all its external references.
 */
const dereference = async (uri: string, options: ReferenceOptions): Promise<ParseResultElement> => {
  const { refSet } = options.dereference;
  // the file is parsed as a whole document, so its URI has no fragment
  const baseURI = url.normalize(url.stripHash(uri));
  let parseResult;

  // if refSet was provided, use it to avoid unnecessary parsing
  if (refSet !== null && refSet.has(baseURI)) {
    // @ts-ignore
    ({ value: parseResult } = refSet.find(propEq(baseURI, 'uri')));
  } else {
    parseResult = await parse(uri, options);
  }

  const mergedOptions = mergeOptions(options, {
    resolve: { baseURI },
    dereference: {
      // if refSet was not provided, then we can work in mutable mode
      immutable: options.dereference.immutable && refSet !== null,
    },
  });

  return dereferenceApiDOM(parseResult, mergedOptions);
};

export default dereference;
