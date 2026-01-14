/**
 * @public
 */
export interface NodeOptions {
  readonly children?: unknown[];
  readonly startLine?: number;
  readonly startCharacter?: number;
  readonly startOffset?: number;
  readonly endLine?: number;
  readonly endCharacter?: number;
  readonly endOffset?: number;
  readonly isMissing?: boolean;
}

/**
 * @public
 */
class Node {
  public static readonly type: string = 'node';

  public readonly type: string = 'node';

  public readonly isMissing: boolean;

  public children: unknown[];

  public startLine?: number;

  public startCharacter?: number;

  public startOffset?: number;

  public endLine?: number;

  public endCharacter?: number;

  public endOffset?: number;

  constructor({
    children = [],
    startLine,
    startCharacter,
    startOffset,
    endLine,
    endCharacter,
    endOffset,
    isMissing = false,
  }: NodeOptions = {}) {
    this.type = (this.constructor as typeof Node).type;
    this.isMissing = isMissing;
    this.children = children;
    this.startLine = startLine;
    this.startCharacter = startCharacter;
    this.startOffset = startOffset;
    this.endLine = endLine;
    this.endCharacter = endCharacter;
    this.endOffset = endOffset;
  }

  // creates shallow clone of node
  public clone(): Node {
    // 1. copy has same prototype as orig
    const copy = Object.create(Object.getPrototypeOf(this));

    // 2. copy has all of orig’s properties
    Object.getOwnPropertyNames(this) // (1)
      .forEach((propKey) => {
        // (2)
        const descriptor = Object.getOwnPropertyDescriptor(this, propKey); // (3)
        // @ts-ignore
        Object.defineProperty(copy, propKey, descriptor); // (4)
      });

    return copy;
  }
}

export default Node;
