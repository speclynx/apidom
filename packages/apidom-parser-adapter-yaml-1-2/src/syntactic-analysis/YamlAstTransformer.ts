import type {
  YamlDocument,
  YamlStream,
  YamlComment,
  YamlMapping,
  YamlKeyValuePair,
  YamlSequence,
  YamlScalar,
  Literal,
  Error,
  ParseResult,
} from '@speclynx/apidom-ast';
import { YamlStyle } from '@speclynx/apidom-ast';
import {
  ParseResultElement,
  AnnotationElement,
  CommentElement,
  SourceMapElement,
  Element,
  MemberElement,
  ObjectElement,
  ArrayElement,
  isPrimitiveElement,
  Namespace,
} from '@speclynx/apidom-datamodel';

// Transform context passed through transformation
interface TransformContext {
  sourceMap: boolean;
  namespace: Namespace;
  annotations: AnnotationElement[];
  processedDocumentCount: number;
}

// Node with type property
interface TypedNode {
  type: string;
  position?: unknown;
  children?: unknown[];
}

// Helper to add source map to element
const maybeAddSourceMap = (node: TypedNode, element: Element, ctx: TransformContext): void => {
  if (!ctx.sourceMap) {
    return;
  }
  const sourceMap = new SourceMapElement();
  // @ts-ignore
  sourceMap.position = node.position;
  // @ts-ignore
  sourceMap.astNode = node;
  element.meta.set('sourceMap', sourceMap);
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

  for (const child of children) {
    const result = transform(child, ctx);
    if (result === null) {
      continue;
    }
    if (Array.isArray(result)) {
      results.push(...result);
    } else {
      results.push(result);
    }
  }

  return results;
};

// Stream: Wraps transformed children in ParseResultElement
const transformStream = (node: YamlStream, ctx: TransformContext): ParseResultElement => {
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
  const element = new ObjectElement();
  // @ts-ignore
  element._content = transformChildren(node.children || [], ctx);
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
  const element = new ArrayElement();
  // @ts-ignore
  element._content = transformChildren(node.children || [], ctx);
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
}

/**
 * Transforms YAML AST to ApiDOM ParseResultElement.
 * @public
 */
export const transformYamlAstToApiDOM = (
  yamlAst: ParseResult,
  { sourceMap = false }: TransformOptions = {},
): ParseResultElement => {
  const ctx: TransformContext = {
    sourceMap,
    namespace: new Namespace(),
    annotations: [],
    processedDocumentCount: 0,
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
