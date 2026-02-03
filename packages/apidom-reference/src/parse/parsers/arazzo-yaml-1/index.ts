import { pick } from 'ramda';
import { ParseResultElement } from '@speclynx/apidom-datamodel';
import {
  parse,
  mediaTypes as ArazzoYAML1MediaTypes,
  detect,
} from '@speclynx/apidom-parser-adapter-arazzo-yaml-1';

import ParserError from '../../../errors/ParserError.ts';
import Parser, { ParserOptions } from '../Parser.ts';
import File from '../../../File.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import type ParseFn from '../../index.ts';
import { parseSourceDescriptions } from '../arazzo-json-1/source-description.ts';
export type { default as Parser, ParserOptions } from '../Parser.ts';
export type { default as File, FileOptions } from '../../../File.ts';

/**
 * @public
 */
export interface ArazzoYAML1ParserOptions extends Omit<ParserOptions, 'name'> {
  readonly parseFn?: typeof ParseFn;
}

/**
 * @public
 */
class ArazzoYAML1Parser extends Parser {
  public refractorOpts!: object;

  public parseFn?: typeof ParseFn;

  constructor(options?: ArazzoYAML1ParserOptions) {
    const {
      parseFn,
      fileExtensions = [],
      mediaTypes = ArazzoYAML1MediaTypes,
      ...rest
    } = options ?? {};

    super({ ...rest, name: 'arazzo-yaml-1', fileExtensions, mediaTypes });
    this.parseFn = parseFn;
  }

  async canParse(file: File): Promise<boolean> {
    const hasSupportedFileExtension =
      this.fileExtensions.length === 0 ? true : this.fileExtensions.includes(file.extension);
    const hasSupportedMediaType = this.mediaTypes.includes(file.mediaType);

    if (!hasSupportedFileExtension) return false;
    if (hasSupportedMediaType) return true;
    if (!hasSupportedMediaType) {
      return detect(file.toString());
    }
    return false;
  }

  async parse(file: File, options?: ReferenceOptions): Promise<ParseResultElement> {
    const source = file.toString();

    try {
      const parserOpts = pick(['sourceMap', 'strict', 'refractorOpts'], this);
      const parseResult = await parse(source, parserOpts);

      const shouldParseSourceDescriptions =
        options?.parse?.parserOpts?.[this.name]?.sourceDescriptions ??
        options?.parse?.parserOpts?.sourceDescriptions;
      if (shouldParseSourceDescriptions) {
        const sourceDescriptions = await parseSourceDescriptions.call(
          this,
          parseResult.api,
          file,
          options!,
        );
        parseResult.push(...sourceDescriptions);
      }

      return parseResult;
    } catch (error: unknown) {
      throw new ParserError(`Error parsing "${file.uri}"`, { cause: error });
    }
  }
}

export default ArazzoYAML1Parser;
