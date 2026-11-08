import { isEmpty } from 'ramda';
import { ParseResultElement } from '@speclynx/apidom-datamodel';
import { selectBestMatch } from '@swaggerexpert/media-types';

import * as url from '../util/url.ts';
import File from '../File.ts';
import * as plugins from '../util/plugins.ts';
import Parser from './parsers/Parser.ts';
import ParseError from '../errors/ParseError.ts';
import UnmatchedParserError from '../errors/UnmatchedParserError.ts';
import { readFile } from '../resolve/util.ts';
import type { ReferenceOptions } from '../options/index.ts';

// media types of a serialization format only, naming no specification
const formatMediaTypes = ['application/json', 'application/yaml', 'text/yaml'];

/**
 * Parses the given file's contents, using the configured parser plugins.
 */
const parseFile = async (file: File, options: ReferenceOptions): Promise<ParseResultElement> => {
  const optsBoundParsers = options.parse.parsers.map((parser) => {
    const clonedParser = Object.create(parser);
    return Object.assign(clonedParser, options.parse.parserOpts);
  });

  const candidates: Parser[] = await plugins.filter('canParse', [file, options], optsBoundParsers);
  // parsers listing the file's media type are tried first, the others in their configured order;
  // for a format media type the configured order decides, as it puts specific parsers first
  const isListing = (parser: Parser) =>
    parser.mediaTypes !== undefined && selectBestMatch(parser.mediaTypes, file.mediaType) !== null;
  const parsers =
    selectBestMatch(formatMediaTypes, file.mediaType) !== null
      ? candidates
      : [...candidates.filter(isListing), ...candidates.filter((p) => !isListing(p))];

  // we couldn't find any parser for this File
  if (isEmpty(parsers)) {
    throw new UnmatchedParserError(`Could not find a parser that can parse the file "${file.uri}"`);
  }

  try {
    const { plugin, result } = await plugins.run('parse', [file, options], parsers);

    // empty files handling
    if (!plugin.allowEmpty && result.isEmpty) {
      return Promise.reject(
        new ParseError(`Error while parsing file "${file.uri}": file is empty`),
      );
    }

    return result;
  } catch (error: any) {
    throw new ParseError(`Error while parsing file "${file.uri}"`, { cause: error });
  }
};

/**
 * Parses a file into ApiDOM.
 */
const parse = async (uri: string, options: ReferenceOptions): Promise<ParseResultElement> => {
  /**
   * If the path is a filesystem path, then convert it to a URL.
   *
   * NOTE: According to the JSON Reference spec, these should already be URLs,
   * but, in practice, many people use local filesystem paths instead.
   * So we're being generous here and doing the conversion automatically.
   * This is not intended to be a 100% bulletproof solution.
   * If it doesn't work for your use-case, then use a URL instead.
   */
  const file = new File({
    uri: url.sanitize(url.stripHash(uri)),
    mediaType: options.parse.mediaType,
  });
  const data = await readFile(file, options);

  return parseFile(new File({ ...file, data }), options);
};

export default parse;
