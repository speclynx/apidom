import StringElement from '../primitives/StringElement.ts';
import type { Meta, Attributes } from '../types.ts';

/**
 * Shape with optional source position properties.
 * @public
 */
interface SourceMapShape {
  startLine?: number;
  startCharacter?: number;
  startOffset?: number;
  endLine?: number;
  endCharacter?: number;
  endOffset?: number;
}

/**
 * SourceMapElement stores source position as a compact VLQ-encoded string.
 *
 * The encoded string contains 6 values: startLine, startCharacter, startOffset,
 * endLine, endCharacter, endOffset. All values use UTF-16 code units,
 * compatible with LSP, TextDocument, and JavaScript string indexing.
 *
 * web-tree-sitter automatically provides position data in UTF-16 code units.
 *
 * @public
 */
class SourceMapElement extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'sourceMap';
  }

  /**
   * Transfers source position properties from one object to another.
   */
  static transfer(from: SourceMapShape, to: SourceMapShape): void {
    to.startLine = from.startLine;
    to.startCharacter = from.startCharacter;
    to.startOffset = from.startOffset;
    to.endLine = from.endLine;
    to.endCharacter = from.endCharacter;
    to.endOffset = from.endOffset;
  }

  /**
   * Creates a SourceMapElement from source position properties.
   * Returns undefined if any position property is not a number.
   * Also assigns position properties to the instance for inspection.
   */
  static from(source: SourceMapShape): SourceMapElement | undefined {
    const { startLine, startCharacter, startOffset, endLine, endCharacter, endOffset } = source;

    if (
      typeof startLine !== 'number' ||
      typeof startCharacter !== 'number' ||
      typeof startOffset !== 'number' ||
      typeof endLine !== 'number' ||
      typeof endCharacter !== 'number' ||
      typeof endOffset !== 'number'
    ) {
      return undefined;
    }

    const packed = packSourceMap([
      startLine,
      startCharacter,
      startOffset,
      endLine,
      endCharacter,
      endOffset,
    ]);

    const sourceMap = new SourceMapElement(packed);
    sourceMap.startLine = startLine;
    sourceMap.startCharacter = startCharacter;
    sourceMap.startOffset = startOffset;
    sourceMap.endLine = endLine;
    sourceMap.endCharacter = endCharacter;
    sourceMap.endOffset = endOffset;

    return sourceMap;
  }

  /**
   * Decodes the VLQ string and applies source position properties to the target.
   */
  public applyTo(target: SourceMapShape): void {
    if (!this.content) return;
    [
      target.startLine,
      target.startCharacter,
      target.startOffset,
      target.endLine,
      target.endCharacter,
      target.endOffset,
    ] = unpackSourceMap(this.content as string);
  }
}

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Encode one unsigned integer to Base64-VLQ
function vlqEncodeInt(value: number): string {
  let vlq = value >>> 0; // ensure unsigned 32-bit
  let out = '';

  do {
    let digit = vlq & 31; // 5 bits
    vlq >>>= 5;
    if (vlq !== 0) digit |= 32; // continuation bit
    out += BASE64[digit];
  } while (vlq !== 0);

  return out;
}

// Decode one unsigned integer from Base64-VLQ, starting at `index`
function vlqDecodeInt(str: string, index = 0): { value: number; next: number } {
  let result = 0;
  let shift = 0;
  let i = index;

  while (true) {
    const ch = str[i++];
    const digit = BASE64.indexOf(ch);
    if (digit === -1) throw new Error(`Invalid Base64 VLQ char: ${ch}`);

    const cont = (digit & 32) !== 0;
    result |= (digit & 31) << shift;
    shift += 5;

    if (!cont) break;
  }

  return { value: result >>> 0, next: i };
}

/**
 * Span of 6 position values: [startLine, startCharacter, startOffset, endLine, endCharacter, endOffset]
 * @public
 */
type Span6 = [number, number, number, number, number, number];

/**
 * Encodes 6 position values into a compact VLQ string.
 * @public
 */
function packSourceMap(v: Span6): string {
  return 'sm1:' + v.map(vlqEncodeInt).join('');
}

/**
 * Decodes a VLQ string into 6 position values.
 * @public
 */
function unpackSourceMap(packed: string): Span6 {
  const s = packed.startsWith('sm1:') ? packed.slice(4) : packed;
  const out: number[] = [];
  let i = 0;
  for (let k = 0; k < 6; k++) {
    const r = vlqDecodeInt(s, i);
    out.push(r.value);
    i = r.next;
  }
  return out as Span6;
}

export default SourceMapElement;
export type { Span6, SourceMapShape };
