import type { ApiDOMErrorOptions } from '@speclynx/apidom-error';

import YamlSchemaError from './YamlSchemaError.ts';
import Node from '../Node.ts';

/**
 * @public
 */
export interface YamlTagErrorOptions<T extends Node = Node> extends ApiDOMErrorOptions {
  readonly specificTagName: string;
  readonly explicitTagName: string;
  readonly tagKind: string;
  readonly tagStartLine?: number;
  readonly tagStartCharacter?: number;
  readonly tagStartOffset?: number;
  readonly tagEndLine?: number;
  readonly tagEndCharacter?: number;
  readonly tagEndOffset?: number;
  readonly nodeCanonicalContent?: string;
  readonly node?: T;
}

/**
 * @public
 */
class YamlTagError extends YamlSchemaError {
  public readonly specificTagName!: string;

  public readonly explicitTagName!: string;

  public readonly tagKind!: string;

  public readonly tagStartLine?: number;

  public readonly tagStartCharacter?: number;

  public readonly tagStartOffset?: number;

  public readonly tagEndLine?: number;

  public readonly tagEndCharacter?: number;

  public readonly tagEndOffset?: number;

  public readonly nodeCanonicalContent?: string;

  public readonly node?: unknown;

  constructor(message?: string, structuredOptions?: YamlTagErrorOptions) {
    super(message, structuredOptions);

    if (typeof structuredOptions !== 'undefined') {
      this.specificTagName = structuredOptions.specificTagName;
      this.explicitTagName = structuredOptions.explicitTagName;
      this.tagKind = structuredOptions.tagKind;
      this.tagStartLine = structuredOptions.tagStartLine;
      this.tagStartCharacter = structuredOptions.tagStartCharacter;
      this.tagStartOffset = structuredOptions.tagStartOffset;
      this.tagEndLine = structuredOptions.tagEndLine;
      this.tagEndCharacter = structuredOptions.tagEndCharacter;
      this.tagEndOffset = structuredOptions.tagEndOffset;
      this.nodeCanonicalContent = structuredOptions.nodeCanonicalContent;
      this.node = structuredOptions.node;
    }
  }
}

export default YamlTagError;
