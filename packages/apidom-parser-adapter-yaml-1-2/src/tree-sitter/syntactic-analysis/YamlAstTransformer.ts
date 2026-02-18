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

// detect indent from first nested block mapping
const detectIndent = (node: YamlStream): number => {
  const defaultIndent = 2;
  const children = node.children || [];

  for (const child of children) {
    const typedChild = child as TypedNode;
    if (typedChild.type !== 'document') continue;

    for (const docChild of typedChild.children || []) {
      const typedDocChild = docChild as TypedNode & { styleGroup?: string };
      if (typedDocChild.type !== 'mapping') continue;

      // look for first key-value pair with a nested mapping
      for (const kvpChild of typedDocChild.children || []) {
        const kvp = kvpChild as TypedNode;
        if (kvp.type !== 'keyValuePair') continue;

        for (const kvpInner of kvp.children || []) {
          const inner = kvpInner as TypedNode & { styleGroup?: string };
          if (
            inner.type === 'mapping' &&
            inner.styleGroup === YamlStyleGroup.Block &&
            typeof inner.startCharacter === 'number' &&
            inner.startCharacter > 0
          ) {
            return inner.startCharacter;
          }
        }
      }
    }
  }

  return defaultIndent;
};

// strip leading '#' from each line of comment text; yaml library adds '#' during stringification
const stripCommentHash = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.replace(/^#/, ''))
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

/**
 * @param children - raw AST children of a mapping/sequence
 * @param containerStartCol - the start column of the container node;
 *   trailing comments whose startCharacter is less than this are out-of-scope
 *   (tree-sitter may place them inside a nested block they don't belong to)
 */
const collectComments = (children: unknown[], containerStartCol?: number): CommentAssociations => {
  const before = new Map<number, string>();
  const after = new Map<number, string>();

  const pendingComments: PendingComment[] = [];
  let lastNonCommentEndLine: number | undefined;

  let ncIdx = 0;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as TypedNode & { content?: string };
    if (child?.type === 'comment') {
      // check if this comment is an inline comment (same line as previous sibling)
      if (
        ncIdx > 0 &&
        pendingComments.length === 0 &&
        lastNonCommentEndLine !== undefined &&
        child.startLine !== undefined &&
        child.startLine === lastNonCommentEndLine
      ) {
        // inline comment on same line as previous sibling
        after.set(ncIdx - 1, stripCommentHash(child.content || ''));
      } else {
        pendingComments.push({
          text: stripCommentHash(child.content || ''),
          startLine: child.startLine,
          startCharacter: child.startCharacter,
        });
      }
      continue;
    }

    // non-comment node: attach any pending comments as commentBefore
    if (pendingComments.length > 0) {
      before.set(ncIdx, pendingComments.map((c) => c.text).join('\n'));
      pendingComments.length = 0;
    }
    lastNonCommentEndLine = child.endLine;
    ncIdx++;
  }

  // trailing comments (after last non-comment child) belong to the container
  // but exclude comments at a lower indentation — those belong to a parent scope
  let trailing: string | null = null;
  const outOfScope: string[] = [];
  if (pendingComments.length > 0) {
    for (const c of pendingComments) {
      if (
        containerStartCol !== undefined &&
        c.startCharacter !== undefined &&
        c.startCharacter < containerStartCol
      ) {
        outOfScope.push(c.text);
      } else {
        // in scope — part of trailing
        trailing = trailing ? `${trailing}\n${c.text}` : c.text;
      }
    }
  }

  return { before, after, trailing, outOfScope };
};

// apply collected comments to transformed ApiDOM elements
const applyComments = (elements: Element[], comments: CommentAssociations): void => {
  comments.before.forEach((text, idx) => {
    const element = elements[idx];
    if (element) {
      if (!element.style) element.style = {};
      const yaml = (element.style.yaml ?? {}) as Record<string, unknown>;
      yaml.commentBefore = text;
      element.style.yaml = yaml;
    }
  });

  // inline comments (same line as the element)
  comments.after.forEach((text, idx) => {
    const element = elements[idx];
    if (element) {
      if (!element.style) element.style = {};
      const yaml = (element.style.yaml ?? {}) as Record<string, unknown>;
      yaml.comment = text;
      element.style.yaml = yaml;
    }
  });
};

// detect flow collection padding from node positions
// gap of 1 between container start and first child start → no padding: [x
// gap of 2+ → padding: [ x
const detectFlowPadding = (node: TypedNode): boolean => {
  const children = (node.children || []) as TypedNode[];
  const firstChild = children[0];
  if (
    firstChild &&
    typeof node.startCharacter === 'number' &&
    typeof firstChild.startCharacter === 'number'
  ) {
    return firstChild.startCharacter - node.startCharacter > 1;
  }
  return true; // default to yaml library default
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

  if (node.comment) {
    yamlStyle.comment = node.comment;
  }
  if (node.commentBefore) {
    yamlStyle.commentBefore = node.commentBefore;
  }

  if (extras) {
    Object.assign(yamlStyle, extras);
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

// Mapping: Transforms to ObjectElement
const transformMapping = (node: YamlMapping, ctx: TransformContext): ObjectElement => {
  const typedMapping = node as unknown as TypedNode;
  const element = new ObjectElement();

  if (ctx.style) {
    // detect flow collection padding from first flow collection encountered
    if (ctx.flowCollectionPadding === null && node.styleGroup === YamlStyleGroup.Flow) {
      ctx.flowCollectionPadding = detectFlowPadding(typedMapping);
    }
    const comments = collectComments(node.children || [], typedMapping.startCharacter);
    const childElements = transformChildren(node.children || [], ctx);
    // @ts-ignore
    element._content = childElements;
    applyComments(childElements, comments);
    element.style = buildYamlStyle(node as unknown as YamlNode, ctx);
    // trailing comments at end of block belong to the container
    if (comments.trailing) {
      const yaml = (element.style!.yaml ?? {}) as Record<string, unknown>;
      yaml.comment = comments.trailing;
      element.style!.yaml = yaml;
    }
    // promote out-of-scope comments to parent scope
    if (comments.outOfScope.length > 0) {
      ctx.promotedComments.push(...comments.outOfScope);
    }
  } else {
    const childElements = transformChildren(node.children || [], ctx);
    // @ts-ignore
    element._content = childElements;
  }

  maybeAddSourceMap(node as unknown as TypedNode, element, ctx);
  return element;
};

// KeyValuePair: Transforms to MemberElement
const transformKeyValuePair = (node: YamlKeyValuePair, ctx: TransformContext): MemberElement => {
  const element = new MemberElement();

  // Transform key and value (these are dynamically defined properties)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keyResult = transform((node as any).key, ctx);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const valueResult = transform((node as any).value, ctx);

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
  const typedSequence = node as unknown as TypedNode;
  const element = new ArrayElement();

  if (ctx.style) {
    // detect flow collection padding from first flow collection encountered
    if (ctx.flowCollectionPadding === null && node.styleGroup === YamlStyleGroup.Flow) {
      ctx.flowCollectionPadding = detectFlowPadding(typedSequence);
    }
    const comments = collectComments(node.children || [], typedSequence.startCharacter);
    const childElements = transformChildren(node.children || [], ctx);
    // @ts-ignore
    element._content = childElements;
    applyComments(childElements, comments);
    element.style = buildYamlStyle(node as unknown as YamlNode, ctx);
    // trailing comments at end of block belong to the container
    if (comments.trailing) {
      const yaml = (element.style!.yaml ?? {}) as Record<string, unknown>;
      yaml.comment = comments.trailing;
      element.style!.yaml = yaml;
    }
    // promote out-of-scope comments to parent scope
    if (comments.outOfScope.length > 0) {
      ctx.promotedComments.push(...comments.outOfScope);
    }
  } else {
    const childElements = transformChildren(node.children || [], ctx);
    // @ts-ignore
    element._content = childElements;
  }

  maybeAddSourceMap(node as unknown as TypedNode, element, ctx);
  return element;
};

// Scalar: Converts to Element via namespace
const transformScalar = (node: YamlScalar, ctx: TransformContext): Element => {
  const element = ctx.namespace.toElement(node.content)!;

  // Translate style information about empty nodes
  if (node.content === '' && node.style === YamlStyle.Plain) {
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
