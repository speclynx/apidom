import { pick } from 'ramda';
import { ParseResultElement } from '@speclynx/apidom-datamodel';
import {
  parse,
  mediaTypes as OverlayYAML1MediaTypes,
  detect,
} from '@speclynx/apidom-parser-adapter-overlay-yaml-1';

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
export interface OverlayYAML1ParserOptions extends Omit<ParserOptions, 'name'> {}

/**
 * @public
 */
class OverlayYAML1Parser extends Parser {
  public refractorOpts!: object;

  constructor(options?: OverlayYAML1ParserOptions) {
    const { fileExtensions = [], mediaTypes = OverlayYAML1MediaTypes, ...rest } = options ?? {};

    super({ ...rest, name: 'overlay-yaml-1', fileExtensions, mediaTypes });
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
      const parserOptsNames = ['sourceMap', 'style', 'strict', 'refractorOpts'] as const;
      const parserOptsGlobal = pick(parserOptsNames, this);
      const parserOptsLocal = pick([...parserOptsNames, 'extends'], (this as any)[this.name] ?? {});
      const parserOpts = { ...parserOptsGlobal, ...parserOptsLocal };

      const parseResult = await parse(source, parserOpts);

      if (parserOpts.extends) {
        await parseExtends(parseResult, file.uri, options!);
      }

      return parseResult;
    } catch (error: unknown) {
      throw new ParserError(`Error parsing "${file.uri}"`, { cause: error });
    }
  }
}

export { parseExtends } from './extends.ts';

export default OverlayYAML1Parser;
