import { TreeCursor, Tree, Point } from 'web-tree-sitter';
import {
  BooleanElement,
  NullElement,
  NumberElement,
  ParseResultElement,
  Element,
  SourceMapElement,
  MemberElement,
  ObjectElement,
  ArrayElement,
  StringElement,
  AnnotationElement,
  isPrimitiveElement,
} from '@speclynx/apidom-datamodel';

interface TransformContext {
  sourceMap: boolean;
  annotations: AnnotationElement[];
}

interface CursorInfo {
  type: string;
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
  text: string;
  isNamed: boolean;
  isMissing: boolean;
  hasError: boolean;
  fieldName: string | null;
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

const toPosition = (info: CursorInfo): [ArrayElement, ArrayElement] => {
  const start = new ArrayElement([
    info.startPosition.row,
    info.startPosition.column,
    info.startIndex,
  ]);
  const end = new ArrayElement([info.endPosition.row, info.endPosition.column, info.endIndex]);

  start.classes.push('position');
  end.classes.push('position');

  return [start, end];
};

const maybeAddSourceMap = (info: CursorInfo, element: Element, ctx: TransformContext): void => {
  if (!ctx.sourceMap) {
    return;
  }

  const sourceMap = new SourceMapElement();
  const [start, end] = toPosition(info);
  sourceMap.push(start);
  sourceMap.push(end);
  element.meta.set('sourceMap', sourceMap);
};

type Transformer = (cursor: TreeCursor, ctx: TransformContext) => Element | null;
type TransformerMap = Record<string, Transformer>;

const transform = (
  cursor: TreeCursor,
  transformerMap: TransformerMap,
  ctx: TransformContext,
): Element | null => {
  const info = getCursorInfo(cursor);

  // Handle missing anonymous literals
  if (!info.isNamed && info.isMissing) {
    const value = info.type || info.text;
    const message = `(Missing ${value})`;
    const element = new AnnotationElement(message);
    element.classes.push('warning');
    maybeAddSourceMap(info, element, ctx);
    ctx.annotations.push(element);
    return null;
  }

  const transformer = transformerMap[info.type];
  if (!transformer) {
    return null; // remove unrecognized nodes
  }

  return transformer(cursor, ctx);
};

const transformChildren = (
  cursor: TreeCursor,
  transformerMap: TransformerMap,
  ctx: TransformContext,
): Element[] => {
  const results: Element[] = [];

  if (cursor.gotoFirstChild()) {
    do {
      const transformed = transform(cursor, transformerMap, ctx);
      if (transformed !== null) {
        results.push(transformed);
      }
    } while (cursor.gotoNextSibling());
    cursor.gotoParent();
  }

  return results;
};

const createTransformers = (transformerMap: TransformerMap): TransformerMap => ({
  document(cursor: TreeCursor, ctx: TransformContext): ParseResultElement {
    const info = getCursorInfo(cursor);
    const element = new ParseResultElement();
    maybeAddSourceMap(info, element, ctx);

    // Transform children
    const children = transformChildren(cursor, transformerMap, ctx);
    for (const child of children) {
      element.push(child);
    }

    // Mark first non-Annotation element as result
    // @ts-ignore
    const elements = element.findElements(isPrimitiveElement);
    if (elements.length > 0) {
      elements[0].classes.push('result');
    }

    // Add collected annotations
    for (const annotation of ctx.annotations) {
      element.push(annotation);
    }
    ctx.annotations = [];

    return element;
  },

  object(cursor: TreeCursor, ctx: TransformContext): ObjectElement {
    const info = getCursorInfo(cursor);
    const element = new ObjectElement();
    maybeAddSourceMap(info, element, ctx);

    // Transform children (pairs)
    const children = transformChildren(cursor, transformerMap, ctx);
    for (const child of children) {
      element.push(child);
    }

    return element;
  },

  array(cursor: TreeCursor, ctx: TransformContext): ArrayElement {
    const info = getCursorInfo(cursor);
    const element = new ArrayElement();
    maybeAddSourceMap(info, element, ctx);

    // Transform children
    const children = transformChildren(cursor, transformerMap, ctx);
    for (const child of children) {
      element.push(child);
    }

    return element;
  },

  pair(cursor: TreeCursor, ctx: TransformContext): MemberElement {
    const info = getCursorInfo(cursor);

    let key: Element | null = null;
    let value: Element | null = null;

    // Find key and value by field name
    if (cursor.gotoFirstChild()) {
      do {
        const fieldName = cursor.currentFieldName;
        if (fieldName === 'key') {
          key = transform(cursor, transformerMap, ctx);
        } else if (fieldName === 'value') {
          value = transform(cursor, transformerMap, ctx);
        } else if (cursor.nodeType === 'ERROR') {
          // Process error nodes
          transform(cursor, transformerMap, ctx);
        }
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }

    const element = new MemberElement(key ?? new StringElement(''), value ?? new StringElement(''));
    maybeAddSourceMap(info, element, ctx);

    return element;
  },

  string(cursor: TreeCursor, ctx: TransformContext): StringElement {
    const info = getCursorInfo(cursor);
    let element: StringElement;

    try {
      element = new StringElement(JSON.parse(info.text));
    } catch (error: unknown) {
      element = new StringElement(info.text);
      if (error instanceof Error) {
        element.meta.set('jsonParse', {
          isError: true,
          errorType: error.name,
          errorMessage: error.message,
        });
      }
    }

    maybeAddSourceMap(info, element, ctx);
    return element;
  },

  number(cursor: TreeCursor, ctx: TransformContext): NumberElement {
    const info = getCursorInfo(cursor);
    const element = new NumberElement(Number(info.text));
    maybeAddSourceMap(info, element, ctx);
    return element;
  },

  null(cursor: TreeCursor, ctx: TransformContext): NullElement {
    const info = getCursorInfo(cursor);
    const element = new NullElement();
    maybeAddSourceMap(info, element, ctx);
    return element;
  },

  true(cursor: TreeCursor, ctx: TransformContext): BooleanElement {
    const info = getCursorInfo(cursor);
    const element = new BooleanElement(true);
    maybeAddSourceMap(info, element, ctx);
    return element;
  },

  false(cursor: TreeCursor, ctx: TransformContext): BooleanElement {
    const info = getCursorInfo(cursor);
    const element = new BooleanElement(false);
    maybeAddSourceMap(info, element, ctx);
    return element;
  },

  ERROR(cursor: TreeCursor, ctx: TransformContext): ParseResultElement | null {
    const info = getCursorInfo(cursor);
    const isUnexpected = !info.hasError;
    const message = isUnexpected ? `(Unexpected ${info.text})` : `(Error ${info.text})`;
    const element = new AnnotationElement(message);

    element.classes.push('error');
    maybeAddSourceMap(info, element, ctx);

    ctx.annotations.push(element);

    return null;
  },
});

// Create the transformers map with self-reference for recursion
const transformers: TransformerMap = {};
Object.assign(transformers, createTransformers(transformers));

/**
 * Syntactic analysis translates TreeSitter CST directly into ApiDOM.
 *
 * Direct transformation from TreeSitter CST using TreeSitter cursor.
 * TreeSitter cursor is a stateful object that allows us to walk syntax tree
 * containing large number of nodes with maximum efficiency.
 *
 * Single pass transformation from CST to ApiDOM.
 * @public
 */
const analyze = (cst: Tree, { sourceMap = false } = {}): ParseResultElement => {
  const cursor = cst.walk();

  const ctx: TransformContext = {
    sourceMap,
    annotations: [],
  };

  const result = transform(cursor, transformers, ctx);

  // Handle case where there's no document, only errors
  if (result === null) {
    const parseResult = new ParseResultElement();
    for (const annotation of ctx.annotations) {
      parseResult.push(annotation);
    }
    return parseResult;
  }

  return result as ParseResultElement;
};

export default analyze;
