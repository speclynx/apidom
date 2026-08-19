import {
  Document,
  stringify,
  isNode,
  Alias,
  Scalar,
  YAMLMap,
  YAMLSeq,
  Pair,
  type Node as YAMLNode,
  type CreateNodeOptions,
  type DocumentOptions,
  type SchemaOptions,
  type ScalarTag,
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

// the YAML library re-derives number text from the JS value (normalizing e.g.
// 1e3 -> 1e+3, 0x1A -> 0x1a) and has no per-node verbatim hook, so numbers with
// faithful rawContent are boxed and emitted through a custom tag whose stringify
// returns the original text; `default: true` keeps the tag implicit in the output
class RawNumber {
  constructor(
    public value: number,
    public raw: string,
  ) {}
}

const rawNumberTag: ScalarTag = {
  tag: 'tag:yaml.org,2002:float',
  default: true,
  identify: (value: unknown): boolean => value instanceof RawNumber,
  resolve: (str: string): number => Number(str),
  stringify: (item): string => (item.value as RawNumber).raw,
};

/**
 * Tracks state across a single serialization: the ancestor chain used for cycle
 * detection, and — when `aliasDuplicateObjects` is enabled — the container node
 * emitted for each element instance, so later occurrences become YAML aliases.
 */
interface NodeContext {
  ancestors: WeakSet<object>;
  emitted?: Map<object, YAMLNode>;
  anchorCount: number;
}

/**
 * Turns an already emitted node into the target of an alias, assigning it an
 * anchor on first use, and returns the alias referring to it.
 */
const toAlias = (node: YAMLNode, context: NodeContext): Alias => {
  if (typeof node.anchor !== 'string') {
    context.anchorCount += 1;
    // eslint-disable-next-line no-param-reassign
    node.anchor = `a${context.anchorCount}`;
  }
  return new Alias(node.anchor);
};

/**
 * Converts an ApiDOM element tree to YAML library AST nodes,
 * preserving style information from `element.style.yaml`.
 */
const toYAMLNode = (element: unknown, context: NodeContext): unknown => {
  if (!isElement(element)) return element;

  const { ancestors, emitted } = context;

  // when aliasDuplicateObjects is enabled every repeat becomes an alias — both a
  // shared sibling and a cycle, which YAML represents with a recursive anchor.
  // Nodes are registered before their children are visited so a self-reference
  // finds them, which is why this precedes the ancestor check.
  const alreadyEmitted = emitted?.get(element as object);
  if (alreadyEmitted !== undefined) return toAlias(alreadyEmitted, context);

  // cycle detection — only ancestors form a cycle; a shared reference to an
  // already serialized sibling is a DAG and must be expanded again
  if (ancestors.has(element as object)) return undefined;

  const style = getStyle(element);

  if (isObjectElement(element)) {
    ancestors.add(element as object);

    const map = new YAMLMap();
    emitted?.set(element as object, map);
    map.flow = style.styleGroup === 'Flow';
    applyComments(map, style);

    element.forEach((value, key, member) => {
      const memberStyle = isMemberElement(member) ? getStyle(member) : {};
      const keyNode = toYAMLNode(key, context);
      const valueNode = toYAMLNode(value, context);
      const pair = new Pair(keyNode, valueNode);

      if (memberStyle.commentBefore && isNode(keyNode)) {
        keyNode.commentBefore = memberStyle.commentBefore;
      }
      if (memberStyle.comment && isNode(valueNode)) {
        valueNode.comment = memberStyle.comment;
      }

      map.items.push(pair);
    });

    ancestors.delete(element as object);

    return map;
  }

  if (isArrayElement(element)) {
    ancestors.add(element as object);

    const seq = new YAMLSeq();
    emitted?.set(element as object, seq);
    seq.flow = style.styleGroup === 'Flow';
    applyComments(seq, style);

    element.forEach((item) => {
      seq.items.push(toYAMLNode(item, context));
    });

    ancestors.delete(element as object);

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

  // emit raw number content verbatim for plain scalars whose rawContent still
  // faithfully represents the current value; only applies to Plain style —
  // quoted scalars are always strings in YAML
  if (style.rawContent && style.scalarStyle === 'Plain' && typeof scalar.value === 'number') {
    if (Number(style.rawContent) === scalar.value) {
      scalar.value = new RawNumber(scalar.value, style.rawContent);
    } else {
      // fallback: infer YAML library format hints; the library may normalize the
      // representation (e.g. 1.0e10 -> 1e+10, 0x1A -> 0x1a) while preserving the
      // format category (exponential, hex, octal, fractional digits)
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

    const rootNode = toYAMLNode(element, {
      ancestors: new WeakSet(),
      emitted: aliasDuplicateObjects ? new Map() : undefined,
      anchorCount: 0,
    });
    const doc = new Document(undefined, { ...allOptions, customTags: [rawNumberTag] });
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
