import { ParseResultElement } from '@speclynx/apidom-datamodel';

import File from '../../File.ts';
import type { ReferenceOptions } from '../../options/index.ts';

/**
 * @public
 */
export interface ParserOptions {
  readonly name: string;
  readonly allowEmpty?: boolean;
  readonly sourceMap?: boolean;
  readonly strict?: boolean;
  readonly fileExtensions?: string[];
  readonly mediaTypes?: string[];
}

/**
 * @public
 */
abstract class Parser {
  public readonly name: string;

  /**
   * Whether to allow "empty" files. This includes zero-byte files.
   */
  public allowEmpty: boolean;

  /**
   * Whether to generate source map during parsing.
   */
  public sourceMap: boolean;

  /**
   * Whether to use strict parsing (native JSON.parse/YAML instead of tree-sitter).
   */
  public strict: boolean;

  /**
   * List of supported file extensions.
   */
  public fileExtensions: string[];

  /**
   * List of supported media types.
   */
  public mediaTypes: string[];

  constructor({
    name,
    allowEmpty = true,
    sourceMap = false,
    strict = true,
    fileExtensions = [],
    mediaTypes = [],
  }: ParserOptions) {
    this.name = name;
    this.allowEmpty = allowEmpty;
    this.sourceMap = sourceMap;
    this.strict = strict;
    this.fileExtensions = fileExtensions;
    this.mediaTypes = mediaTypes;
  }

  abstract canParse(file: File, options: ReferenceOptions): boolean | Promise<boolean>;
  abstract parse(
    file: File,
    options: ReferenceOptions,
  ): ParseResultElement | Promise<ParseResultElement>;
}

export default Parser;
