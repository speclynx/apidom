import { TreeCursor, Point } from 'web-tree-sitter';

class TreeCursorSyntaxNode {
  public readonly type: string;

  public readonly startPosition: Point;

  public readonly endPosition: Point;

  public readonly startIndex: number;

  public readonly endIndex: number;

  public readonly text: string;

  public readonly isNamed: boolean;

  public readonly isMissing: boolean;

  public fieldName: string | null = null;

  public hasError = false;

  public readonly children: TreeCursorSyntaxNode[] = [];

  public previousSibling: TreeCursorSyntaxNode | undefined;

  constructor(cursor: TreeCursor) {
    this.type = cursor.nodeType;
    this.startPosition = cursor.startPosition;
    this.endPosition = cursor.endPosition;
    this.startIndex = cursor.startIndex;
    this.endIndex = cursor.endIndex;
    this.text = cursor.nodeText;
    this.isNamed = cursor.nodeIsNamed;
    this.isMissing = cursor.nodeIsMissing;
  }

  get keyNode(): TreeCursorSyntaxNode | undefined {
    if (this.type === 'flow_pair' || this.type === 'block_mapping_pair') {
      return this.children.find((node) => node.fieldName === 'key');
    }
    return undefined;
  }

  get valueNode(): TreeCursorSyntaxNode | undefined {
    if (this.type === 'flow_pair' || this.type === 'block_mapping_pair') {
      return this.children.find((node) => node.fieldName === 'value');
    }
    return undefined;
  }

  get tag(): TreeCursorSyntaxNode | undefined {
    let { previousSibling } = this;

    while (typeof previousSibling !== 'undefined' && previousSibling.type !== 'tag') {
      ({ previousSibling } = previousSibling);
    }

    return previousSibling;
  }

  get anchor(): TreeCursorSyntaxNode | undefined {
    let { previousSibling } = this;

    while (typeof previousSibling !== 'undefined' && previousSibling.type !== 'anchor') {
      ({ previousSibling } = previousSibling);
    }

    return previousSibling;
  }

  get firstNamedChild(): TreeCursorSyntaxNode | undefined {
    return this.children.find((node) => node.isNamed);
  }

  setFieldName(cursor: TreeCursor) {
    this.fieldName = cursor.currentFieldName;
    return this;
  }

  setHasError(cursor: TreeCursor) {
    this.hasError = cursor.currentNode.hasError;
    return this;
  }

  setPreviousSibling(previousSibling: TreeCursorSyntaxNode | undefined) {
    this.previousSibling = previousSibling;
  }

  pushChildren(...children: TreeCursorSyntaxNode[]) {
    this.children.push(...children);
  }
}

export default TreeCursorSyntaxNode;
