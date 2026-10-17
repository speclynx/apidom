import {
  ParseResultElement,
  AnnotationElement,
  CommentElement,
  Element,
  MemberElement,
  ObjectElement,
  ArrayElement,
  isPrimitiveElement,
  Namespace,
  SourceMapElement,
} from '@speclynx/apidom-datamodel';

import type Error from './ast/Error.ts';
import type Literal from './ast/Literal.ts';
import type ParseResult from './ast/ParseResult.ts';
import type YamlDocument from './ast/nodes/YamlDocument.ts';
import type YamlStream from './ast/nodes/YamlStream.ts';
import type YamlComment from './ast/nodes/YamlComment.ts';
import type YamlMapping from './ast/nodes/YamlMapping.ts';
import type YamlKeyValuePair from './ast/nodes/YamlKeyValuePair.ts';
import type YamlSequence from './ast/nodes/YamlSequence.ts';
import type YamlScalar from './ast/nodes/YamlScalar.ts';
import type YamlNode from './ast/nodes/YamlNode.ts';
import { isComment, isDocument } from './ast/nodes/predicates.ts';
import { YamlStyle, YamlStyleGroup } from './ast/nodes/YamlStyle.ts';

// Transform context passed through transformation
interface TransformContext {
  sourceMap: boolean;
  style: boolean;
  namespace: Namespace;
  annotations: AnnotationElement[];
  processedDocumentCount: number;
  indent: number;
  flowCollectionPadding: boolean | null; // detected from first flow collection; null = not yet detected
  // whether block sequences in mappings are indented past their key, detected from the first one;
  // null = not yet detected
  indentSeq: boolean | null;
  // comments that were out-of-scope for a nested block and need to be
  // applied as commentBefore on the next sibling in the parent scope
  promotedComments: string[];
}

// Node with type property and flat position properties
interface TypedNode {
  type: string;
  startLine?: number;
  startCharacter?: number;
  startOffset?: number;
  endLine?: number;
  endCharacter?: number;
  endOffset?: number;
  children?: unknown[];
}

// Helper to add source map to element
const maybeAddSourceMap = (node: TypedNode, element: Element, ctx: TransformContext): void => {
  if (!ctx.sourceMap) {
    return;
  }

  SourceMapElement.transfer(node, element);
};

// find the first descendant matching a type path through the AST
const findFirst = (node: TypedNode, path: string[]): TypedNode | undefined => {
  if (path.length === 0) return node;
  const [type, ...rest] = path;
  for (const child of (node.children || []) as TypedNode[]) {
    if (child.type !== type) continue;
    const found = findFirst(child, rest);
    if (found) return found;
  }
  return undefined;
};

// detect indent from first nested block mapping (stream > document > mapping > keyValuePair > mapping)
const detectIndent = (node: YamlStream): number => {
  const nested = findFirst(node as unknown as TypedNode, [
    'document',
    'mapping',
    'keyValuePair',
    'mapping',
  ]) as (TypedNode & { styleGroup?: string }) | undefined;

  if (
    nested?.styleGroup === YamlStyleGroup.Block &&
    typeof nested.startCharacter === 'number' &&
    nested.startCharacter > 0
  ) {
    return nested.startCharacter;
  }

  return 2;
};

// strip leading '#' from each line of comment text; yaml library adds '#' during
// stringification; a bare '#' becomes a single space — the yaml library's encoding
// for an empty comment, which its stringifier turns back into '#' (plain '' would
// be dropped)
const stripCommentHash = (text: string): string =>
  text
    .split('\n')
    .map((line) => (line === '#' ? ' ' : line.replace(/^#/, '')))
    .join('\n');

// collect comment texts from raw AST children, indexed by position relative to non-comment siblings
interface CommentAssociations {
  before: Map<number, string>; // index of non-comment child → commentBefore text
  after: Map<number, string>; // index of non-comment child → inline comment (same line)
  trailing: string | null; // comments after the last non-comment child (belong to container)
  outOfScope: string[]; // trailing comments at a lower indentation (belong to parent scope)
}

interface PendingComment {
  text: string;
  startLine?: number;
  startCharacter?: number;
}

// is the comment on the same line as the previous non-comment sibling?
const isInlineComment = (
  child: TypedNode,
  lastEndLine: number | undefined,
  pending: PendingComment[],
): boolean => {
  return pending.length === 0 && lastEndLine !== undefined && child.startLine === lastEndLine;
};

/**
 * @param children - raw AST children of a mapping/sequence
 * @param containerStartCol - the start column of the container node;
 *   trailing comments whose startCharacter is less than this are out-of-scope
 *   (tree-sitter may place them inside a nested block they don't belong to)
 */
const collectComments = (children: unknown[], containerStartCol?: number): CommentAssociations => {
  const before = new Map<number, string>();
  const after = new Map<number, string>();
  const pending: PendingComment[] = [];
  let lastNonCommentEndLine: number | undefined;
  let elementIdx = 0;

  for (const child of children as (TypedNode & { content?: string })[]) {
    if (child?.type === 'comment') {
      const text = stripCommentHash(child.content || '');
      if (elementIdx > 0 && isInlineComment(child, lastNonCommentEndLine, pending)) {
        after.set(elementIdx - 1, text);
      } else {
        pending.push({ text, startLine: child.startLine, startCharacter: child.startCharacter });
      }
      continue;
    }

    // non-comment node: attach any pending comments as commentBefore
    if (pending.length > 0) {
      before.set(elementIdx, pending.map((c) => c.text).join('\n'));
      pending.length = 0;
    }
    lastNonCommentEndLine = child.endLine;
    elementIdx++;
  }

  // remaining pending comments are trailing — split into in-scope and out-of-scope
  let trailing: string | null = null;
  const outOfScope: string[] = [];
  for (const c of pending) {
    if (
      containerStartCol !== undefined &&
      c.startCharacter !== undefined &&
      c.startCharacter < containerStartCol
    ) {
      outOfScope.push(c.text);
    } else {
      trailing = trailing ? `${trailing}\n${c.text}` : c.text;
    }
  }

  return { before, after, trailing, outOfScope };
};

// set a yaml style property on an element, initializing style.yaml if needed
const setYamlStyleProp = (element: Element, key: string, value: string): void => {
  if (!element.style) element.style = {};
  const yaml = (element.style.yaml ?? {}) as Record<string, unknown>;
  yaml[key] = value;
  element.style.yaml = yaml;
};

const getYamlStyleProp = (element: Element, key: string): unknown =>
  (element.style?.yaml as Record<string, unknown> | undefined)?.[key];

// apply collected comments to transformed ApiDOM elements
const applyComments = (elements: Element[], comments: CommentAssociations): void => {
  comments.before.forEach((text, idx) => {
    if (elements[idx]) setYamlStyleProp(elements[idx], 'commentBefore', text);
  });
  comments.after.forEach((text, idx) => {
    if (elements[idx]) setYamlStyleProp(elements[idx], 'comment', text);
  });
};

// detect flow collection padding from node positions
// gap of 1 between container start and first child start → no padding: [x
// gap of 2+ → padding: [ x
// gap of 1 between container start and first child start → no padding: {x
// gap of 2+ → padding: { x
const detectFlowPadding = (node: TypedNode): boolean => {
  const firstChild = ((node.children || []) as TypedNode[])[0];
  if (
    firstChild &&
    typeof node.startCharacter === 'number' &&
    typeof firstChild.startCharacter === 'number'
  ) {
    // a sequence item starts with its tag or anchor, which aren't part of its node's position
    const { tag, anchor } = firstChild as unknown as YamlNode;
    const firstStart = Math.min(
      firstChild.startCharacter,
      tag?.startCharacter ?? Infinity,
      anchor?.startCharacter ?? Infinity,
    );
    return firstStart - node.startCharacter > 1;
  }
  return true;
};

// build yaml style object for an element
const buildYamlStyle = (
  node: YamlNode,
  ctx: TransformContext,
  extras?: Record<string, unknown>,
): Record<string, unknown> => {
  const yamlStyle: Record<string, unknown> = {
    styleGroup: node.styleGroup,
    indent: ctx.indent,
  };

  if (ctx.flowCollectionPadding !== null) {
    yamlStyle.flowCollectionPadding = ctx.flowCollectionPadding;
  }
  if (ctx.indentSeq !== null) {
    yamlStyle.indentSeq = ctx.indentSeq;
  }

  if (node.comment) {
    yamlStyle.comment = node.comment;
  }
  if (node.commentBefore) {
    yamlStyle.commentBefore = node.commentBefore;
  }
  // an untagged node has the non-specific tag '?' when it's a plain scalar and '!' otherwise
  // (YAML 1.2 §6.9.1); an explicit '!' on any other node means the same as no tag
  const tag = node.tag?.explicitName;
  if (tag !== undefined && tag !== (node.style === YamlStyle.Plain ? '?' : '!')) {
    yamlStyle.tag = tag;
  }
  // the anchor's name, without the & indicator
  if (node.anchor) {
    yamlStyle.anchor = node.anchor.name.slice(1);
  }

  if (extras) {
    for (const [key, value] of Object.entries(extras)) {
      if (value !== undefined) yamlStyle[key] = value;
    }
  }

  return { yaml: yamlStyle };
};

// Transform a single node based on its type
const transform = (node: unknown, ctx: TransformContext): Element | Element[] | null => {
  if (node === null || node === undefined) {
    return null;
  }

  const typedNode = node as TypedNode;
  const nodeType = typedNode.type;

  switch (nodeType) {
    case 'stream':
      return transformStream(typedNode as unknown as YamlStream, ctx);
    case 'document':
      return transformDocument(typedNode as unknown as YamlDocument, ctx);
    case 'mapping':
      return transformMapping(typedNode as unknown as YamlMapping, ctx);
    case 'keyValuePair':
      return transformKeyValuePair(typedNode as unknown as YamlKeyValuePair, ctx);
    case 'sequence':
      return transformSequence(typedNode as unknown as YamlSequence, ctx);
    case 'scalar':
      return transformScalar(typedNode as unknown as YamlScalar, ctx);
    case 'comment':
      return transformComment(typedNode as unknown as YamlComment, ctx);
    case 'literal':
      return transformLiteral(typedNode as unknown as Literal, ctx);
    case 'error':
      return transformError(typedNode as unknown as Error, ctx);
    default:
      // Unknown node type - skip
      return null;
  }
};

// Transform children array and flatten results
const transformChildren = (children: unknown[], ctx: TransformContext): Element[] => {
  const results: Element[] = [];
  let pendingPromoted: string[] = [];

  for (const child of children) {
    const result = transform(child, ctx);
    if (result === null) {
      // collect any promoted comments generated during this null transform
      if (ctx.style && ctx.promotedComments.length > 0) {
        pendingPromoted.push(...ctx.promotedComments);
        ctx.promotedComments = [];
      }
      continue;
    }

    // apply promoted comments from PREVIOUS children as commentBefore on this element
    if (ctx.style && pendingPromoted.length > 0) {
      const target = Array.isArray(result) ? result[0] : result;
      if (target) {
        if (!target.style) target.style = {};
        const yaml = (target.style.yaml ?? {}) as Record<string, unknown>;
        const existing = yaml.commentBefore as string | undefined;
        const promoted = pendingPromoted.join('\n');
        yaml.commentBefore = existing ? `${promoted}\n${existing}` : promoted;
        target.style.yaml = yaml;
      }
      pendingPromoted = [];
    }

    // collect any promoted comments generated by this child's transform
    // (these will be applied to the NEXT sibling)
    if (ctx.style && ctx.promotedComments.length > 0) {
      pendingPromoted.push(...ctx.promotedComments);
      ctx.promotedComments = [];
    }

    if (Array.isArray(result)) {
      results.push(...result);
    } else {
      results.push(result);
    }
  }

  // if promoted comments remain after all children, propagate up to parent scope
  if (pendingPromoted.length > 0) {
    ctx.promotedComments.push(...pendingPromoted);
  }

  return results;
};

// stream comments that precede the first document, joined; null when there are none
// (stream children are in source order, so everything before the document node qualifies)
// stream comments around the first document: before it, on its last line and on the lines after it,
// up to the next document
const collectStreamComments = (node: YamlStream) => {
  const comments = { before: [] as string[], inline: [] as string[], after: [] as string[] };
  let root: TypedNode | undefined;
  const collect = (comment: YamlComment) => {
    const text = stripCommentHash(comment.content);
    if (!root) comments.before.push(text);
    else if ((comment as unknown as TypedNode).startLine === root.endLine)
      comments.inline.push(text);
    else comments.after.push(text);
  };
  for (const child of node.children) {
    if (isDocument(child)) {
      if (root) break;
      // comments after an explicit document start (---) or before an explicit document end (...)
      // are the document's own children, around its root node
      const children = (child.children || []) as unknown[];
      const rootIndex = children.findIndex((c) => !isComment(c));
      if (rootIndex === -1) break;
      children.slice(0, rootIndex).filter(isComment).forEach(collect);
      root = children[rootIndex] as TypedNode;
      children
        .slice(rootIndex + 1)
        .filter(isComment)
        .forEach(collect);
    } else if (isComment(child)) {
      collect(child);
    }
  }
  return comments;
};

// Stream: Wraps transformed children in ParseResultElement
const transformStream = (node: YamlStream, ctx: TransformContext): ParseResultElement => {
  // detect indent from the stream structure (only needed for style preservation)
  if (ctx.style) {
    ctx.indent = detectIndent(node);
  }

  const element = new ParseResultElement();

  // Transform all children
  const children = transformChildren(node.children || [], ctx);

  // Flatten and set content
  // @ts-ignore
  element._content = children.flat(1);

  // Mark first primitive element as result
  // @ts-ignore
  const elements = element.findElements(isPrimitiveElement);
  if (elements.length > 0) {
    const resultElement = elements[0];
    resultElement.classes.push('result');

    // stream comments before the first document belong above the result element, ones on its last
    // line to it and ones on later lines to the document; capture them so style round-trips can
    // re-emit them
    if (ctx.style) {
      const { before, inline, after } = collectStreamComments(node);
      if (before.length > 0) {
        const existing = getYamlStyleProp(resultElement, 'commentBefore');
        const text = before.join('\n');
        setYamlStyleProp(
          resultElement,
          'commentBefore',
          typeof existing === 'string' ? `${text}\n${existing}` : text,
        );
      }
      if (inline.length > 0 && typeof getYamlStyleProp(resultElement, 'comment') !== 'string') {
        setYamlStyleProp(resultElement, 'comment', inline.join('\n'));
      }
      // comments promoted out of the root's last nested collection have no next sibling to precede
      // and end the root, so they come before the stream comments after it
      after.unshift(...ctx.promotedComments);
      if (after.length > 0) {
        setYamlStyleProp(resultElement, 'documentComment', after.join('\n'));
      }
      // line breaks other than LF, which the YAML library writes
      if (node.lineBreak === '\r\n') {
        setYamlStyleProp(resultElement, 'lineBreak', node.lineBreak);
      }
    }
  }

  // Add collected annotations
  ctx.annotations.forEach((annotationElement: AnnotationElement) => {
    element.push(annotationElement);
  });
  ctx.annotations = [];

  return element;
};

// Document: Returns transformed children for first doc, warns for subsequent docs
const transformDocument = (node: YamlDocument, ctx: TransformContext): Element[] | null => {
  const shouldWarnAboutMoreDocuments = ctx.processedDocumentCount === 1;
  const shouldSkipVisitingMoreDocuments = ctx.processedDocumentCount >= 1;

  if (shouldWarnAboutMoreDocuments) {
    const message = 'Only first document within YAML stream will be used. Rest will be discarded.';
    const element = new AnnotationElement(message);
    element.classes.push('warning');
    maybeAddSourceMap(node as unknown as TypedNode, element, ctx);
    ctx.annotations.push(element);
  }

  if (shouldSkipVisitingMoreDocuments) {
    return null;
  }

  ctx.processedDocumentCount += 1;

  // Transform and return children
  return transformChildren(node.children || [], ctx);
};

// shared logic for transformMapping and transformSequence
const transformCollection = (
  element: ObjectElement | ArrayElement,
  node: YamlMapping | YamlSequence,
  ctx: TransformContext,
): void => {
  const typedNode = node as unknown as TypedNode;
  const children = node.children || [];

  if (ctx.style) {
    if (ctx.flowCollectionPadding === null && node.styleGroup === YamlStyleGroup.Flow) {
      ctx.flowCollectionPadding = detectFlowPadding(typedNode);
    }
    const comments = collectComments(children, typedNode.startCharacter);
    const childElements = transformChildren(children, ctx);
    // bypass content setter to avoid re-refracting already-transformed elements
    (element as any)._content = childElements; // eslint-disable-line @typescript-eslint/no-explicit-any
    applyComments(childElements, comments);
    element.style = buildYamlStyle(node as unknown as YamlNode, ctx, {
      comment: comments.trailing,
      // a single pair written directly in a flow sequence (e.g. [a: 1])
      singlePair: node.style === YamlStyle.SinglePair || undefined,
    });
    if (comments.outOfScope.length > 0) {
      ctx.promotedComments.push(...comments.outOfScope);
    }
  } else {
    (element as any)._content = transformChildren(children, ctx); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  maybeAddSourceMap(typedNode, element, ctx);
};

// Mapping: Transforms to ObjectElement
const transformMapping = (node: YamlMapping, ctx: TransformContext): ObjectElement => {
  const element = new ObjectElement();
  transformCollection(element, node, ctx);
  return element;
};

// KeyValuePair: Transforms to MemberElement
const transformKeyValuePair = (node: YamlKeyValuePair, ctx: TransformContext): MemberElement => {
  const element = new MemberElement();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { key, value } = node as any;

  if (ctx.style && ctx.indentSeq === null && value?.type === 'sequence') {
    const { styleGroup, startCharacter } = value as YamlSequence & TypedNode;
    if (styleGroup === YamlStyleGroup.Block) {
      ctx.indentSeq = startCharacter! > (node as unknown as TypedNode).startCharacter!;
    }
  }

  // Transform key and value (these are dynamically defined properties)
  const keyResult = transform(key, ctx);
  const valueResult = transform(value, ctx);

  // @ts-ignore
  element.content.key = keyResult;
  // @ts-ignore
  element.content.value = valueResult;

  maybeAddSourceMap(node as unknown as TypedNode, element, ctx);

  // Process any errors in children
  (node.children || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((child: any) => child?.type === 'error')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .forEach((errorNode: any) => {
      transformErrorAsAnnotation(errorNode as Error, ctx);
    });

  return element;
};

// Sequence: Transforms to ArrayElement
const transformSequence = (node: YamlSequence, ctx: TransformContext): ArrayElement => {
  const element = new ArrayElement();
  transformCollection(element, node, ctx);
  return element;
};

// Scalar: Converts to Element via namespace
const transformScalar = (node: YamlScalar, ctx: TransformContext): Element => {
  const element = ctx.namespace.toElement(node.content)!;

  // Translate style information about empty nodes; an empty node (YAML 1.2 §7.2) is a null unless
  // a tag other than the null tag makes it something else (e.g. !!str makes it an empty string)
  const tag = node.tag?.explicitName;
  const isEmptyNode =
    node.content === '' &&
    node.style === YamlStyle.Plain &&
    [undefined, '?', '!!null', '!<tag:yaml.org,2002:null>'].includes(tag);
  if (isEmptyNode) {
    element.classes.push('yaml-e-node');
    element.classes.push('yaml-e-scalar');
  }

  if (ctx.style) {
    const extras: Record<string, unknown> = {
      scalarStyle: node.style,
    };
    if (node.rawContent !== undefined) {
      extras.rawContent = node.rawContent;
    }
    if (node.alias !== undefined) {
      extras.alias = node.alias;
    }
    element.style = buildYamlStyle(node as unknown as YamlNode, ctx, extras);
  }

  maybeAddSourceMap(node as unknown as TypedNode, element, ctx);
  return element;
};

// Comment: Returns CommentElement for pre-document comments only
const transformComment = (node: YamlComment, ctx: TransformContext): CommentElement | null => {
  const isStreamComment = ctx.processedDocumentCount === 0;

  // Only interested in stream comments before the first document
  if (isStreamComment) {
    // @ts-ignore
    const element = new CommentElement(node.content);
    maybeAddSourceMap(node as unknown as TypedNode, element, ctx);
    return element;
  }

  return null;
};

// Literal: Handles missing nodes (creates warning annotation)
const transformLiteral = (node: Literal, ctx: TransformContext): null => {
  if (node.isMissing) {
    const message = `(Missing ${node.value})`;
    const element = new AnnotationElement(message);
    element.classes.push('warning');
    maybeAddSourceMap(node as unknown as TypedNode, element, ctx);
    ctx.annotations.push(element);
  }

  return null;
};

// Error as annotation (used by keyValuePair)
const transformErrorAsAnnotation = (node: Error, ctx: TransformContext): void => {
  const message = node.isUnexpected
    ? '(Unexpected YAML syntax error)'
    : '(Error YAML syntax error)';
  const element = new AnnotationElement(message);
  element.classes.push('error');
  maybeAddSourceMap(node as unknown as TypedNode, element, ctx);
  ctx.annotations.push(element);
};

// Error: Creates error annotation (adds to annotations array)
const transformError = (node: Error, ctx: TransformContext): null => {
  const message = node.isUnexpected
    ? '(Unexpected YAML syntax error)'
    : '(Error YAML syntax error)';
  const element = new AnnotationElement(message);
  element.classes.push('error');
  maybeAddSourceMap(node as unknown as TypedNode, element, ctx);

  ctx.annotations.push(element);
  return null;
};

// Error at root level: Creates ParseResultElement with error annotation
const transformRootError = (node: Error, ctx: TransformContext): ParseResultElement => {
  const message = node.isUnexpected
    ? '(Unexpected YAML syntax error)'
    : '(Error YAML syntax error)';
  const element = new AnnotationElement(message);
  element.classes.push('error');
  maybeAddSourceMap(node as unknown as TypedNode, element, ctx);

  const parseResultElement = new ParseResultElement();
  parseResultElement.push(element);
  return parseResultElement;
};

export interface TransformOptions {
  sourceMap?: boolean;
  style?: boolean;
}

/**
 * Transforms YAML AST to ApiDOM ParseResultElement.
 * @public
 */
export const transformYamlAstToApiDOM = (
  yamlAst: ParseResult,
  { sourceMap = false, style = false }: TransformOptions = {},
): ParseResultElement => {
  const ctx: TransformContext = {
    sourceMap,
    style,
    namespace: new Namespace(),
    annotations: [],
    processedDocumentCount: 0,
    indent: 2,
    flowCollectionPadding: null,
    indentSeq: null,
    promotedComments: [],
  };

  const rootNode = yamlAst.rootNode as TypedNode | undefined;

  // Handle empty parse result
  if (!rootNode) {
    return new ParseResultElement();
  }

  // Handle root-level error (no valid stream, just an error node)
  if (rootNode.type === 'error') {
    return transformRootError(rootNode as unknown as Error, ctx);
  }

  const result = transform(rootNode, ctx);

  // Result should be a ParseResultElement from transformStream
  if (result instanceof ParseResultElement) {
    return result;
  }

  // Fallback: wrap in ParseResultElement
  const parseResult = new ParseResultElement();
  if (result !== null) {
    if (Array.isArray(result)) {
      result.forEach((el) => parseResult.push(el));
    } else {
      parseResult.push(result);
    }
  }
  return parseResult;
};

export default transformYamlAstToApiDOM;
