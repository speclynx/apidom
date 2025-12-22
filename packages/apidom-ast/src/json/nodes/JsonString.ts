import JsonNode from './JsonNode.ts';
import type { NodeOptions } from '../../Node.ts';

/**
 * @public
 */
export interface JsonStringOptions extends NodeOptions {
  value: string;
  parseError?: Error;
}

/**
 * @public
 */
class JsonString extends JsonNode {
  public static readonly type: string = 'string';

  public readonly value: string;

  public readonly parseError?: Error;

  constructor({ value, parseError, ...rest }: JsonStringOptions) {
    super(rest);
    this.value = value;
    this.parseError = parseError;
  }
}

export default JsonString;
