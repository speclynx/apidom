import { TreeCursor, Point as TreeSitterPoint } from 'web-tree-sitter';
import {
  Error,
  Literal,
  ParseResult,
  Point,
  Position,
  YamlNode,
  YamlAlias,
  YamlAnchor,
  YamlComment,
  YamlDirective,
  YamlDocument,
  YamlKeyValuePair,
  YamlMapping,
  YamlNodeKind,
  YamlReferenceManager,
  YamlScalar,
  YamlSequence,
  YamlStream,
  YamlStyle,
  YamlStyleGroup,
  YamlTag,
} from '@speclynx/apidom-ast';

interface CursorInfo {
  type: string;
  startPosition: TreeSitterPoint;
  endPosition: TreeSitterPoint;
  startIndex: number;
  endIndex: number;
  text: string;
  isNamed: boolean;
  isMissing: boolean;
  hasError: boolean;
  fieldName: string | null;
}

interface TransformContext {
  sourceMap: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  referenceManager: YamlReferenceManager;
}

interface SiblingContext {
  tag?: CursorInfo;
  anchor?: CursorInfo;
}

const getCursorInfo = (cursor: TreeCursor): CursorInfo => ({
  type: cursor.nodeType,
  startPosition: cursor.startPosition,
  endPosition: cursor.endPosition,
  startIndex: cursor.startIndex,
  endIndex: cursor.endIndex,
  text: cursor.nodeText,
  isNamed: cursor.nodeIsNamed,
  isMissing: cursor.nodeIsMissing,
  hasError: cursor.currentNode.hasError,
  fieldName: cursor.currentFieldName,
});

const toPosition = (info: CursorInfo): Position => {
  const start = new Point({
    row: info.startPosition.row,
    column: info.startPosition.column,
    char: info.startIndex,
  });
  const end = new Point({
    row: info.endPosition.row,
    column: info.endPosition.column,
    char: info.endIndex,
  });
  return new Position({ start, end });
};

const toYamlAnchor = (info: CursorInfo): YamlAnchor => {
  return new YamlAnchor({
    name: info.text,
    position: toPosition(info),
  });
};

const toYamlTag = (info: CursorInfo, tagInfo: CursorInfo | undefined): YamlTag => {
  const explicitName = tagInfo?.text || (info.type === 'plain_scalar' ? '?' : '!');
  const kind = info.type.endsWith('mapping')
    ? YamlNodeKind.Mapping
    : info.type.endsWith('sequence')
      ? YamlNodeKind.Sequence
      : YamlNodeKind.Scalar;
  const position = tagInfo ? toPosition(tagInfo) : undefined;

  return new YamlTag({ explicitName, kind, position });
};

const registerAnchor = <T extends YamlNode>(node: T, ctx: TransformContext): void => {
  if (node.anchor !== undefined) {
    ctx.referenceManager.addAnchor(node);
  }
};

// Using 'any' for TransformResult to avoid recursive type issues
// The actual types are: YamlNode, YamlDirective, YamlDocument, YamlKeyValuePair, YamlComment, Literal, Error, ParseResult, arrays, or null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransformResult = any;
type Transformer = (
  cursor: TreeCursor,
  ctx: TransformContext,
  siblings: SiblingContext,
) => TransformResult;
type TransformerMap = Record<string, Transformer>;

// Helper to process children and track siblings for tag/anchor association
const processChildren = (
  cursor: TreeCursor,
  ctx: TransformContext,
  transformerMap: TransformerMap,
): TransformResult[] => {
  const results: TransformResult[] = [];
  let siblings: SiblingContext = {};

  if (cursor.gotoFirstChild()) {
    do {
      const info = getCursorInfo(cursor);

      // Track tag and anchor siblings
      if (info.type === 'tag') {
        siblings.tag = info;
        continue;
      }
      if (info.type === 'anchor') {
        siblings.anchor = info;
        continue;
      }

      const result = transform(cursor, ctx, transformerMap, siblings);
      if (result !== null) {
        results.push(result);
      }

      // Reset siblings after consuming them for a value node
      if (
        info.type.endsWith('scalar') ||
        info.type.endsWith('mapping') ||
        info.type.endsWith('sequence') ||
        info.type === 'block_node' ||
        info.type === 'flow_node'
      ) {
        siblings = {};
      }
    } while (cursor.gotoNextSibling());
    cursor.gotoParent();
  }

  return results;
};

// Helper to process key-value pair children
const processKeyValuePairChildren = (
  cursor: TreeCursor,
  ctx: TransformContext,
  transformerMap: TransformerMap,
): { key: TransformResult | null; value: TransformResult | null; errors: TransformResult[] } => {
  let key: TransformResult | null = null;
  let value: TransformResult | null = null;
  const errors: TransformResult[] = [];
  let siblings: SiblingContext = {};

  if (cursor.gotoFirstChild()) {
    do {
      const info = getCursorInfo(cursor);
      const fieldName = cursor.currentFieldName;

      // Track tag and anchor siblings
      if (info.type === 'tag') {
        siblings.tag = info;
        continue;
      }
      if (info.type === 'anchor') {
        siblings.anchor = info;
        continue;
      }

      if (fieldName === 'key') {
        key = transform(cursor, ctx, transformerMap, siblings);
        siblings = {};
      } else if (fieldName === 'value') {
        value = transform(cursor, ctx, transformerMap, siblings);
        siblings = {};
      } else if (info.type === 'ERROR') {
        const errorResult = transform(cursor, ctx, transformerMap, siblings);
        if (errorResult !== null) {
          errors.push(errorResult);
        }
      }
    } while (cursor.gotoNextSibling());
    cursor.gotoParent();
  }

  return { key, value, errors };
};

const transform = (
  cursor: TreeCursor,
  ctx: TransformContext,
  transformerMap: TransformerMap,
  siblings: SiblingContext = {},
): TransformResult => {
  const info = getCursorInfo(cursor);

  // Handle missing anonymous literals
  if (!info.isNamed && !info.isMissing) {
    // Skip non-named, non-missing nodes (like punctuation)
    return null;
  }

  if (!info.isNamed && info.isMissing) {
    const position = toPosition(info);
    const nodeValue = info.type || info.text;
    return new Literal({ value: nodeValue, position, isMissing: true });
  }

  const transformer = transformerMap[info.type];
  if (!transformer) {
    return null;
  }

  return transformer(cursor, ctx, siblings);
};

const createTransformers = (transformerMap: TransformerMap): TransformerMap => ({
  stream(cursor: TreeCursor, ctx: TransformContext): ParseResult {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    const children = processChildren(cursor, ctx, transformerMap);

    const stream = new YamlStream({
      children: children.filter((c) => c !== null),
      position,
      isMissing: info.isMissing,
    });

    return new ParseResult({ children: [stream] });
  },

  yaml_directive(cursor: TreeCursor, _ctx: TransformContext): YamlDirective {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    // Get version from first named child
    let version: string | undefined;
    if (cursor.gotoFirstChild()) {
      do {
        if (cursor.nodeIsNamed) {
          version = cursor.nodeText;
          break;
        }
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }

    return new YamlDirective({
      position,
      name: '%YAML',
      parameters: { version },
    });
  },

  tag_directive(cursor: TreeCursor, ctx: TransformContext): YamlDirective {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    const children: string[] = [];
    if (cursor.gotoFirstChild()) {
      do {
        if (cursor.nodeIsNamed) {
          children.push(cursor.nodeText);
        }
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }

    const tagDirective = new YamlDirective({
      position,
      name: '%TAG',
      parameters: {
        handle: children[0],
        prefix: children[1],
      },
    });

    ctx.schema.registerTagDirective(tagDirective);

    return tagDirective;
  },

  reserved_directive(cursor: TreeCursor, _ctx: TransformContext): YamlDirective {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    const children: string[] = [];
    if (cursor.gotoFirstChild()) {
      do {
        if (cursor.nodeIsNamed) {
          children.push(cursor.nodeText);
        }
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }

    return new YamlDirective({
      position,
      name: children[0],
      parameters: {
        handle: children[1],
        prefix: children[2],
      },
    });
  },

  document(cursor: TreeCursor, ctx: TransformContext): YamlDocument {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    const children = processChildren(cursor, ctx, transformerMap);

    return new YamlDocument({
      children: children.flat().filter((c) => c !== null),
      position,
      isMissing: info.isMissing,
    });
  },

  block_node(
    cursor: TreeCursor,
    ctx: TransformContext,
    _siblings: SiblingContext,
  ): TransformResult[] {
    // Block node is a wrapper - return its children
    const children = processChildren(cursor, ctx, transformerMap);
    return children as TransformResult[];
  },

  flow_node(
    cursor: TreeCursor,
    ctx: TransformContext,
    siblings: SiblingContext,
  ): TransformResult[] | YamlScalar {
    // Check if there's a kind node (scalar, mapping, or sequence)
    let hasKindNode = false;
    let lastChildInfo: CursorInfo | null = null;

    if (cursor.gotoFirstChild()) {
      do {
        const childInfo = getCursorInfo(cursor);
        lastChildInfo = childInfo;
        if (
          childInfo.type.endsWith('scalar') ||
          childInfo.type.endsWith('mapping') ||
          childInfo.type.endsWith('sequence')
        ) {
          hasKindNode = true;
        }
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }

    if (hasKindNode) {
      const children = processChildren(cursor, ctx, transformerMap);
      return children as TransformResult[];
    }

    // No kind node - create empty scalar
    if (lastChildInfo) {
      const emptyPoint = new Point({
        row: lastChildInfo.endPosition.row,
        column: lastChildInfo.endPosition.column,
        char: lastChildInfo.endIndex,
      });
      const emptyScalarNode = new YamlScalar({
        content: '',
        anchor: siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined,
        tag: toYamlTag(lastChildInfo, siblings.tag),
        position: new Position({ start: emptyPoint, end: emptyPoint }),
        styleGroup: YamlStyleGroup.Flow,
        style: YamlStyle.Plain,
      });

      registerAnchor(emptyScalarNode, ctx);

      return emptyScalarNode;
    }

    return [];
  },

  block_mapping(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlMapping {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const mappingNode = new YamlMapping({
      children: children.filter((c) => c !== null),
      position,
      anchor,
      tag,
      styleGroup: YamlStyleGroup.Block,
      style: YamlStyle.NextLine,
      isMissing: info.isMissing,
    });

    registerAnchor(mappingNode, ctx);

    return ctx.schema.resolve(mappingNode);
  },

  block_mapping_pair(cursor: TreeCursor, ctx: TransformContext): YamlKeyValuePair {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    const { key, value, errors } = processKeyValuePairChildren(cursor, ctx, transformerMap);

    const children: TransformResult[] = [];

    // Handle empty key
    if (key === null) {
      const emptyPoint = new Point({
        row: info.startPosition.row,
        column: info.startPosition.column,
        char: info.startIndex,
      });
      const emptyKey = new YamlScalar({
        content: '',
        position: new Position({ start: emptyPoint, end: emptyPoint }),
        tag: new YamlTag({ explicitName: '?', kind: YamlNodeKind.Scalar }),
        styleGroup: YamlStyleGroup.Flow,
        style: YamlStyle.Plain,
      });
      children.push(emptyKey);
    } else {
      children.push(key);
    }

    // Handle empty value
    if (value === null) {
      const emptyPoint = new Point({
        row: info.endPosition.row,
        column: info.endPosition.column,
        char: info.endIndex,
      });
      const emptyValue = new YamlScalar({
        content: '',
        position: new Position({ start: emptyPoint, end: emptyPoint }),
        tag: new YamlTag({ explicitName: '?', kind: YamlNodeKind.Scalar }),
        styleGroup: YamlStyleGroup.Flow,
        style: YamlStyle.Plain,
      });
      children.push(emptyValue);
    } else {
      children.push(value);
    }

    children.push(...errors);

    return new YamlKeyValuePair({
      children: children.flat().filter((c) => c !== null),
      position,
      styleGroup: YamlStyleGroup.Block,
      isMissing: info.isMissing,
    });
  },

  flow_mapping(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlMapping {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const mappingNode = new YamlMapping({
      children: children.flat().filter((c) => c !== null),
      position,
      anchor,
      tag,
      styleGroup: YamlStyleGroup.Flow,
      style: YamlStyle.Explicit,
      isMissing: info.isMissing,
    });

    registerAnchor(mappingNode, ctx);

    return ctx.schema.resolve(mappingNode);
  },

  flow_pair(cursor: TreeCursor, ctx: TransformContext): YamlKeyValuePair {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    const { key, value, errors } = processKeyValuePairChildren(cursor, ctx, transformerMap);

    const children: TransformResult[] = [];

    // Handle empty key
    if (key === null) {
      const emptyPoint = new Point({
        row: info.startPosition.row,
        column: info.startPosition.column,
        char: info.startIndex,
      });
      const emptyKey = new YamlScalar({
        content: '',
        position: new Position({ start: emptyPoint, end: emptyPoint }),
        tag: new YamlTag({ explicitName: '?', kind: YamlNodeKind.Scalar }),
        styleGroup: YamlStyleGroup.Flow,
        style: YamlStyle.Plain,
      });
      children.push(emptyKey);
    } else {
      children.push(key);
    }

    // Handle empty value
    if (value === null) {
      const emptyPoint = new Point({
        row: info.endPosition.row,
        column: info.endPosition.column,
        char: info.endIndex,
      });
      const emptyValue = new YamlScalar({
        content: '',
        position: new Position({ start: emptyPoint, end: emptyPoint }),
        tag: new YamlTag({ explicitName: '?', kind: YamlNodeKind.Scalar }),
        styleGroup: YamlStyleGroup.Flow,
        style: YamlStyle.Plain,
      });
      children.push(emptyValue);
    } else {
      children.push(value);
    }

    children.push(...errors);

    return new YamlKeyValuePair({
      children: children.flat().filter((c) => c !== null),
      position,
      styleGroup: YamlStyleGroup.Flow,
      isMissing: info.isMissing,
    });
  },

  block_sequence(
    cursor: TreeCursor,
    ctx: TransformContext,
    siblings: SiblingContext,
  ): YamlSequence {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const sequenceNode = new YamlSequence({
      children: children.flat(Infinity).filter((c) => c !== null),
      position,
      anchor,
      tag,
      styleGroup: YamlStyleGroup.Block,
      style: YamlStyle.NextLine,
    });

    registerAnchor(sequenceNode, ctx);

    return ctx.schema.resolve(sequenceNode);
  },

  block_sequence_item(cursor: TreeCursor, ctx: TransformContext): TransformResult[] {
    const info = getCursorInfo(cursor);
    const children = processChildren(cursor, ctx, transformerMap);

    // If only one child (the "-" literal), create empty node
    if (children.length === 0) {
      const emptyPoint = new Point({
        row: info.endPosition.row,
        column: info.endPosition.column,
        char: info.endIndex,
      });
      const emptyScalarNode = new YamlScalar({
        content: '',
        tag: new YamlTag({ explicitName: '?', kind: YamlNodeKind.Scalar }),
        position: new Position({ start: emptyPoint, end: emptyPoint }),
        styleGroup: YamlStyleGroup.Flow,
        style: YamlStyle.Plain,
      });
      return [emptyScalarNode];
    }

    return children as TransformResult[];
  },

  flow_sequence(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlSequence {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const sequenceNode = new YamlSequence({
      children: children.flat().filter((c) => c !== null),
      position,
      anchor,
      tag,
      styleGroup: YamlStyleGroup.Flow,
      style: YamlStyle.Explicit,
    });

    registerAnchor(sequenceNode, ctx);

    return ctx.schema.resolve(sequenceNode);
  },

  plain_scalar(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlScalar {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const scalarNode = new YamlScalar({
      content: info.text,
      anchor,
      tag,
      position,
      styleGroup: YamlStyleGroup.Flow,
      style: YamlStyle.Plain,
    });

    registerAnchor(scalarNode, ctx);

    return ctx.schema.resolve(scalarNode);
  },

  single_quote_scalar(
    cursor: TreeCursor,
    ctx: TransformContext,
    siblings: SiblingContext,
  ): YamlScalar {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const scalarNode = new YamlScalar({
      content: info.text,
      anchor,
      tag,
      position,
      styleGroup: YamlStyleGroup.Flow,
      style: YamlStyle.SingleQuoted,
    });

    registerAnchor(scalarNode, ctx);

    return ctx.schema.resolve(scalarNode);
  },

  double_quote_scalar(
    cursor: TreeCursor,
    ctx: TransformContext,
    siblings: SiblingContext,
  ): YamlScalar {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const scalarNode = new YamlScalar({
      content: info.text,
      anchor,
      tag,
      position,
      styleGroup: YamlStyleGroup.Flow,
      style: YamlStyle.DoubleQuoted,
    });

    registerAnchor(scalarNode, ctx);

    return ctx.schema.resolve(scalarNode);
  },

  block_scalar(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlScalar {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;
    const style = info.text.startsWith('|')
      ? YamlStyle.Literal
      : info.text.startsWith('>')
        ? YamlStyle.Folded
        : YamlStyle.Plain;

    const scalarNode = new YamlScalar({
      content: info.text,
      anchor,
      tag,
      position,
      styleGroup: YamlStyleGroup.Block,
      style,
    });

    registerAnchor(scalarNode, ctx);

    return ctx.schema.resolve(scalarNode);
  },

  comment(cursor: TreeCursor): YamlComment {
    const info = getCursorInfo(cursor);
    return new YamlComment({ content: info.text });
  },

  alias(cursor: TreeCursor, ctx: TransformContext): YamlScalar {
    const info = getCursorInfo(cursor);
    const alias = new YamlAlias({ content: info.text });
    return ctx.referenceManager.resolveAlias(alias);
  },

  ERROR(cursor: TreeCursor, ctx: TransformContext): Error | ParseResult {
    const info = getCursorInfo(cursor);
    const position = toPosition(info);

    const children = processChildren(cursor, ctx, transformerMap);

    const errorNode = new Error({
      children: children.filter((c) => c !== null),
      position,
      isUnexpected: !info.hasError,
      isMissing: info.isMissing,
      value: info.text,
    });

    // If at root level, wrap in ParseResult
    // This check is simplified - we'll handle it in the main analyze function
    return errorNode;
  },
});

// Create transformers with self-reference for recursion
const transformers: TransformerMap = {};
Object.assign(transformers, createTransformers(transformers));

/**
 * Transform TreeSitter CST directly to YAML AST using cursor-based traversal.
 */
export const transformCstToYamlAst = (cursor: TreeCursor, ctx: TransformContext): ParseResult => {
  const result = transform(cursor, ctx, transformers);

  if (result === null) {
    return new ParseResult({ children: [] });
  }

  if (result instanceof ParseResult) {
    return result;
  }

  if (result instanceof Error) {
    return new ParseResult({ children: [result] });
  }

  return new ParseResult({ children: [result] });
};

export default transformCstToYamlAst;
