import {
  Document,
  stringify,
  isNode,
  Scalar,
  YAMLMap,
  YAMLSeq,
  Pair,
  type Node as YAMLNode,
  type CreateNodeOptions,
  type DocumentOptions,
  type SchemaOptions,
  type ToStringOptions,
} from 'yaml';
import {
  Element,
  isElement,
  isObjectElement,
  isArrayElement,
  isRefElement,
  isLinkElement,
  isStringElement,
  isMemberElement,
} from '@speclynx/apidom-datamodel';

import toValue from './value.ts';

interface YAMLElementStyle {
  scalarStyle?: string;
  styleGroup?: string;
  rawContent?: string;
  indent?: number;
  flowCollectionPadding?: boolean;
  comment?: string;
  commentBefore?: string;
}

const getStyle = (element: Element): YAMLElementStyle => {
  return (element.style?.yaml ?? {}) as YAMLElementStyle;
};

// map our scalarStyle strings to YAML library Scalar.Type constants
const scalarStyleMap: Record<string, Scalar.Type> = {
  Plain: Scalar.PLAIN,
  SingleQuoted: Scalar.QUOTE_SINGLE,
  DoubleQuoted: Scalar.QUOTE_DOUBLE,
  Literal: Scalar.BLOCK_LITERAL,
  Folded: Scalar.BLOCK_FOLDED,
};

// the YAML library emits comments as `#${text}` verbatim; style values carry the original
// text after '#' (including any leading whitespace), so pass them through unchanged
const applyComments = (node: YAMLNode, style: YAMLElementStyle): void => {
  if (style.comment) node.comment = style.comment;
  if (style.commentBefore) node.commentBefore = style.commentBefore;
};

/**
 * @public
 */
export interface YAMLSerializerOptions
  extends
    DocumentOptions,
    Pick<CreateNodeOptions, 'aliasDuplicateObjects'>,
    Pick<SchemaOptions, 'sortMapEntries'>,
    ToStringOptions {
  /** Include %YAML directive and document marker */
  directive?: boolean;
  /** Preserve original formatting styles from `element.style.yaml` */
  preserveStyle?: boolean;
  /** Padding inside flow collections (e.g. `{ a: 1 }` vs `{a: 1}`) */
  flowCollectionPadding?: boolean;
}

/**
 * Converts an ApiDOM element tree to YAML library AST nodes,
 * preserving style information from `element.style.yaml`.
 */
const toYAMLNode = (element: unknown, visited: WeakSet<object>): unknown => {
  if (!isElement(element)) return element;

  // cycle detection
  if (visited.has(element as object)) return undefined;
  visited.add(element as object);

  const style = getStyle(element);

  if (isObjectElement(element)) {
    const map = new YAMLMap();
    map.flow = style.styleGroup === 'Flow';
    applyComments(map, style);

    element.forEach((value, key, member) => {
      const memberStyle = isMemberElement(member) ? getStyle(member) : {};
      const keyNode = toYAMLNode(key, visited);
      const valueNode = toYAMLNode(value, visited);
      const pair = new Pair(keyNode, valueNode);

      if (memberStyle.commentBefore && isNode(keyNode)) {
        keyNode.commentBefore = memberStyle.commentBefore;
      }
      if (memberStyle.comment && isNode(valueNode)) {
        valueNode.comment = memberStyle.comment;
      }

      map.items.push(pair);
    });

    return map;
  }

  if (isArrayElement(element)) {
    const seq = new YAMLSeq();
    seq.flow = style.styleGroup === 'Flow';
    applyComments(seq, style);

    element.forEach((item) => {
      seq.items.push(toYAMLNode(item, visited));
    });

    return seq;
  }

  if (isRefElement(element)) {
    return new Scalar(String(toValue(element)));
  }

  if (isLinkElement(element)) {
    return new Scalar(isStringElement(element.href) ? toValue(element.href) : '');
  }

  // scalar element (string, number, boolean, null)
  const scalarType = style.scalarStyle ? scalarStyleMap[style.scalarStyle] : undefined;

  const scalar = new Scalar(toValue(element));
  if (scalarType) {
    scalar.type = scalarType;
  }

  // use rawContent to infer YAML library format hints for plain scalars that resolved to numbers;
  // only applies to Plain style — quoted scalars are always strings in YAML.
  // note: the YAML library may normalize the representation (e.g. 1.0e10 -> 1e+10, 0x1A -> 0x1a)
  // while preserving the format category (exponential, hex, octal, fractional digits)
  if (style.rawContent && style.scalarStyle === 'Plain' && typeof scalar.value === 'number') {
    if (/[eE]/.test(style.rawContent)) {
      scalar.format = 'EXP';
    } else if (/^0x/i.test(style.rawContent)) {
      scalar.format = 'HEX';
    } else if (/^0o/i.test(style.rawContent)) {
      scalar.format = 'OCT';
    }
    const dotMatch = style.rawContent.match(/\.(\d+)/);
    if (dotMatch) {
      scalar.minFractionDigits = dotMatch[1].length;
    }
  }

  applyComments(scalar, style);

  return scalar;
};

/**
 * @public
 */
const serializer = (
  element: Element,
  {
    directive = false,
    preserveStyle = false,
    aliasDuplicateObjects = false,
    ...options
  }: YAMLSerializerOptions = {},
): string => {
  const allOptions: YAMLSerializerOptions = { aliasDuplicateObjects, ...options };

  if (preserveStyle) {
    const style = getStyle(element);
    if (options.indent === undefined && typeof style.indent === 'number') {
      allOptions.indent = style.indent;
    }
    if (typeof style.flowCollectionPadding === 'boolean') {
      allOptions.flowCollectionPadding = style.flowCollectionPadding;
    }

    const rootNode = toYAMLNode(element, new WeakSet());
    const doc = new Document(undefined, allOptions);
    doc.contents = rootNode as YAMLNode;

    if (directive) {
      doc.directives!.yaml.explicit = true;
    }

    return doc.toString(allOptions);
  }

  if (directive) {
    const doc = new Document(toValue(element), allOptions);
    doc.directives!.yaml.explicit = true;
    return doc.toString(allOptions);
  }

  return stringify(toValue(element), allOptions);
};

export default serializer;
