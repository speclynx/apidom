import { TreeCursor, Point as TreeSitterPoint } from 'web-tree-sitter';

import Error from './ast/Error.ts';
import Literal from './ast/Literal.ts';
import ParseResult from './ast/ParseResult.ts';
import YamlNode from './ast/nodes/YamlNode.ts';
import YamlAlias from './ast/nodes/YamlAlias.ts';
import YamlAnchor from './ast/nodes/YamlAnchor.ts';
import YamlComment from './ast/nodes/YamlComment.ts';
import YamlDirective from './ast/nodes/YamlDirective.ts';
import YamlDocument from './ast/nodes/YamlDocument.ts';
import YamlKeyValuePair from './ast/nodes/YamlKeyValuePair.ts';
import YamlMapping from './ast/nodes/YamlMapping.ts';
import YamlScalar from './ast/nodes/YamlScalar.ts';
import YamlSequence from './ast/nodes/YamlSequence.ts';
import YamlStream from './ast/nodes/YamlStream.ts';
import YamlTag, { YamlNodeKind } from './ast/nodes/YamlTag.ts';
import { YamlStyle, YamlStyleGroup } from './ast/nodes/YamlStyle.ts';
import YamlReferenceManager from './ast/anchors-aliases/ReferenceManager.ts';

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

// Flat position properties extracted from CursorInfo
interface PositionProps {
  startLine: number;
  startCharacter: number;
  startOffset: number;
  endLine: number;
  endCharacter: number;
  endOffset: number;
}

const toPositionProps = (info: CursorInfo): PositionProps => ({
  startLine: info.startPosition.row,
  startCharacter: info.startPosition.column,
  startOffset: info.startIndex,
  endLine: info.endPosition.row,
  endCharacter: info.endPosition.column,
  endOffset: info.endIndex,
});

const toYamlAnchor = (info: CursorInfo): YamlAnchor => {
  return new YamlAnchor({
    name: info.text,
    ...toPositionProps(info),
  });
};

const toYamlTag = (info: CursorInfo, tagInfo: CursorInfo | undefined): YamlTag => {
  const explicitName = tagInfo?.text || (info.type === 'plain_scalar' ? '?' : '!');
  const kind = info.type.endsWith('mapping')
    ? YamlNodeKind.Mapping
    : info.type.endsWith('sequence')
      ? YamlNodeKind.Sequence
      : YamlNodeKind.Scalar;
  const positionProps = tagInfo ? toPositionProps(tagInfo) : undefined;

  return new YamlTag({ explicitName, kind, ...positionProps });
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
    const nodeValue = info.type || info.text;
    return new Literal({ value: nodeValue, ...toPositionProps(info), isMissing: true });
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

    const children = processChildren(cursor, ctx, transformerMap);

    const stream = new YamlStream({
      children: children.filter((c) => c !== null),
      ...toPositionProps(info),
      isMissing: info.isMissing,
    });

    return new ParseResult({ children: [stream] });
  },

  yaml_directive(cursor: TreeCursor, _ctx: TransformContext): YamlDirective {
    const info = getCursorInfo(cursor);

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
      ...toPositionProps(info),
      name: '%YAML',
      parameters: { version },
    });
  },

  tag_directive(cursor: TreeCursor, ctx: TransformContext): YamlDirective {
    const info = getCursorInfo(cursor);

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
      ...toPositionProps(info),
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
      ...toPositionProps(info),
      name: children[0],
      parameters: {
        handle: children[1],
        prefix: children[2],
      },
    });
  },

  document(cursor: TreeCursor, ctx: TransformContext): YamlDocument {
    const info = getCursorInfo(cursor);

    const children = processChildren(cursor, ctx, transformerMap);

    return new YamlDocument({
      children: children.flat().filter((c) => c !== null),
      ...toPositionProps(info),
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
      const emptyScalarNode = new YamlScalar({
        content: '',
        anchor: siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined,
        tag: toYamlTag(lastChildInfo, siblings.tag),
        startLine: lastChildInfo.endPosition.row,
        startCharacter: lastChildInfo.endPosition.column,
        startOffset: lastChildInfo.endIndex,
        endLine: lastChildInfo.endPosition.row,
        endCharacter: lastChildInfo.endPosition.column,
        endOffset: lastChildInfo.endIndex,
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
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const mappingNode = new YamlMapping({
      children: children.filter((c) => c !== null),
      ...toPositionProps(info),
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

    const { key, value, errors } = processKeyValuePairChildren(cursor, ctx, transformerMap);

    const children: TransformResult[] = [];

    // Handle empty key
    if (key === null) {
      const emptyKey = new YamlScalar({
        content: '',
        startLine: info.startPosition.row,
        startCharacter: info.startPosition.column,
        startOffset: info.startIndex,
        endLine: info.startPosition.row,
        endCharacter: info.startPosition.column,
        endOffset: info.startIndex,
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
      const emptyValue = new YamlScalar({
        content: '',
        startLine: info.endPosition.row,
        startCharacter: info.endPosition.column,
        startOffset: info.endIndex,
        endLine: info.endPosition.row,
        endCharacter: info.endPosition.column,
        endOffset: info.endIndex,
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
      ...toPositionProps(info),
      styleGroup: YamlStyleGroup.Block,
      isMissing: info.isMissing,
    });
  },

  flow_mapping(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlMapping {
    const info = getCursorInfo(cursor);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const mappingNode = new YamlMapping({
      children: children.flat().filter((c) => c !== null),
      ...toPositionProps(info),
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

    const { key, value, errors } = processKeyValuePairChildren(cursor, ctx, transformerMap);

    const children: TransformResult[] = [];

    // Handle empty key
    if (key === null) {
      const emptyKey = new YamlScalar({
        content: '',
        startLine: info.startPosition.row,
        startCharacter: info.startPosition.column,
        startOffset: info.startIndex,
        endLine: info.startPosition.row,
        endCharacter: info.startPosition.column,
        endOffset: info.startIndex,
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
      const emptyValue = new YamlScalar({
        content: '',
        startLine: info.endPosition.row,
        startCharacter: info.endPosition.column,
        startOffset: info.endIndex,
        endLine: info.endPosition.row,
        endCharacter: info.endPosition.column,
        endOffset: info.endIndex,
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
      ...toPositionProps(info),
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
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const sequenceNode = new YamlSequence({
      children: children.flat(Infinity).filter((c) => c !== null),
      ...toPositionProps(info),
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
      const emptyScalarNode = new YamlScalar({
        content: '',
        tag: new YamlTag({ explicitName: '?', kind: YamlNodeKind.Scalar }),
        startLine: info.endPosition.row,
        startCharacter: info.endPosition.column,
        startOffset: info.endIndex,
        endLine: info.endPosition.row,
        endCharacter: info.endPosition.column,
        endOffset: info.endIndex,
        styleGroup: YamlStyleGroup.Flow,
        style: YamlStyle.Plain,
      });
      return [emptyScalarNode];
    }

    return children as TransformResult[];
  },

  flow_sequence(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlSequence {
    const info = getCursorInfo(cursor);
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const children = processChildren(cursor, ctx, transformerMap);

    const sequenceNode = new YamlSequence({
      children: children.flat().filter((c) => c !== null),
      ...toPositionProps(info),
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
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const scalarNode = new YamlScalar({
      content: info.text,
      anchor,
      tag,
      ...toPositionProps(info),
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
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const scalarNode = new YamlScalar({
      content: info.text,
      anchor,
      tag,
      ...toPositionProps(info),
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
    const tag = toYamlTag(info, siblings.tag);
    const anchor = siblings.anchor ? toYamlAnchor(siblings.anchor) : undefined;

    const scalarNode = new YamlScalar({
      content: info.text,
      anchor,
      tag,
      ...toPositionProps(info),
      styleGroup: YamlStyleGroup.Flow,
      style: YamlStyle.DoubleQuoted,
    });

    registerAnchor(scalarNode, ctx);

    return ctx.schema.resolve(scalarNode);
  },

  block_scalar(cursor: TreeCursor, ctx: TransformContext, siblings: SiblingContext): YamlScalar {
    const info = getCursorInfo(cursor);
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
      ...toPositionProps(info),
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

    const children = processChildren(cursor, ctx, transformerMap);

    const errorNode = new Error({
      children: children.filter((c) => c !== null),
      ...toPositionProps(info),
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
