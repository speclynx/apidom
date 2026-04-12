import { pick } from 'ramda';
import { ParseResultElement } from '@speclynx/apidom-datamodel';
import {
  parse,
  mediaTypes as OverlayJSON1MediaTypes,
  detect,
} from '@speclynx/apidom-parser-adapter-overlay-json-1';

import ParserError from '../../../errors/ParserError.ts';
import Parser, { ParserOptions } from '../Parser.ts';
import File from '../../../File.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { parseExtends } from './extends.ts';
export type { default as Parser, ParserOptions } from '../Parser.ts';
export type { default as File, FileOptions } from '../../../File.ts';

/**
 * @public
 */
export interface OverlayJSON1ParserOptions extends Omit<ParserOptions, 'name'> {}

/**
 * @public
 */
class OverlayJSON1Parser extends Parser {
  public refractorOpts!: object;

  constructor(options?: OverlayJSON1ParserOptions) {
    const { fileExtensions = [], mediaTypes = OverlayJSON1MediaTypes, ...rest } = options ?? {};

    super({ ...rest, name: 'overlay-json-1', fileExtensions, mediaTypes });
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
      const parserOpts = pick(['sourceMap', 'style', 'strict', 'refractorOpts'], {
        ...this,
        ...((this as Record<string, unknown>)[this.name] as object),
      });
      const parseResult = await parse(source, parserOpts);

      const shouldParseExtends =
        options?.parse?.parserOpts?.[this.name]?.extends ?? options?.parse?.parserOpts?.extends;
      if (shouldParseExtends) {
        await parseExtends(parseResult, file.uri, options!);
      }

      return parseResult;
    } catch (error: unknown) {
      throw new ParserError(`Error parsing "${file.uri}"`, { cause: error });
    }
  }
}

export { parseExtends } from './extends.ts';

export default OverlayJSON1Parser;
