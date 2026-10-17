import {
  Document,
  parseDocument,
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
import { stringifyString } from 'yaml/util';
import {
  Element,
  isElement,
  isObjectElement,
  isArrayElement,
  isRefElement,
  isLinkElement,
  isStringElement,
  isNumberElement,
  isBooleanElement,
  isNullElement,
  isMemberElement,
  includesClasses,
} from '@speclynx/apidom-datamodel';

import toValue from './value.ts';
import { createCycleSafeReplacer } from './json.ts';

interface YAMLElementStyle {
  scalarStyle?: string;
  styleGroup?: string;
  rawContent?: string;
  tag?: string;
  anchor?: string;
  // the name of the alias the scalar was resolved from
  alias?: string;
  singlePair?: boolean;
  indent?: number;
  flowCollectionPadding?: boolean;
  indentSeq?: boolean;
  comment?: string;
  commentBefore?: string;
  // a comment on the lines after the root node, written as the document's comment
  documentComment?: string;
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

// the element types each tag of the YAML 1.2 core schema can be written on
const tagFits: Record<string, (element: Element) => boolean> = {
  str: isStringElement,
  // from 1e21 an integer is written in exponent form (e.g. 1e+21), which isn't an int
  int: (element) => isNumberElement(element) && Number.isSafeInteger(toValue(element)),
  float: isNumberElement,
  bool: isBooleanElement,
  null: isNullElement,
  map: isObjectElement,
  seq: isArrayElement,
};

// writes back the tag recorded as written in the source ('!!str', '!<tag:yaml.org,2002:str>', or
// the non-specific '!' that makes a scalar a string), as long as the element still fits it
const applyTag = (node: YAMLNode, element: Element, style: YAMLElementStyle): void => {
  if (style.tag === undefined) return;
  const match = /^!!(\w+)$|^!<tag:yaml\.org,2002:(\w+)>$/.exec(style.tag);
  const name = style.tag === '!' ? 'str' : (match?.[1] ?? match?.[2]);
  if (name !== undefined && Object.hasOwn(tagFits, name) && tagFits[name](element)) {
    node.tag = style.tag;
  }
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

// the YAML library quotes a plain string that would otherwise resolve to another type (e.g. 1,
// true), but an explicit tag already makes it a string; tagged strings are boxed and emitted
// without that check, keeping every other quoting rule
class TaggedString {
  constructor(public value: string) {}
}

const taggedStringTag: ScalarTag = {
  tag: 'tag:yaml.org,2002:str',
  default: true,
  identify: (value: unknown): boolean => value instanceof TaggedString,
  resolve: (str: string): string => str,
  stringify: (item, ctx, onComment, onChompKeep): string =>
    stringifyString(
      { ...item, value: (item.value as TaggedString).value },
      ctx,
      onComment,
      onChompKeep,
    ),
};

// the YAML library writes a space between a node's properties (anchor, tag) and the content after
// them, which leaves a trailing space when there's no content; an empty node with properties is
// boxed and emitted as its properties alone instead, except as an implicit key, where the space
// separates them from the ':' indicator; the box's tag name only identifies it
class EmptyNodeProperties {
  constructor(public properties: string) {}
}

const emptyNodePropertiesTag: ScalarTag = {
  tag: 'tag:yaml.org,2002:null',
  default: true,
  identify: (value: unknown): boolean => value instanceof EmptyNodeProperties,
  resolve: (): null => null,
  stringify: (item, ctx): string =>
    (item.value as EmptyNodeProperties).properties + (ctx.implicitKey ? ' ' : ''),
};

// the YAML library refolds a block scalar's lines; a block scalar is boxed with its source text,
// whose lines are indented relative to the block's parent node, and emitted as that text
class RawBlockScalar {
  constructor(
    public value: string,
    public text: string,
  ) {}
}

// whether a block scalar's text has the value when its parent node is at the column
// (-1 at top level)
const hasValue = (text: string, value: string, column: number): boolean => {
  const doc = parseDocument(column < 0 ? `${text}\n` : `${' '.repeat(column)}- ${text}\n`);
  return doc.errors.length === 0 && (column < 0 ? doc.toJS() : doc.toJS()[0]) === value;
};

const rawBlockScalarTag: ScalarTag = {
  tag: 'tag:yaml.org,2002:str',
  default: true,
  identify: (value: unknown): boolean => value instanceof RawBlockScalar,
  resolve: (str: string): string => str,
  stringify: (item, ctx, onComment, onChompKeep): string => {
    const { value, text } = item.value as RawBlockScalar;
    if (!ctx.implicitKey && !ctx.inFlow) {
      // the library places block content an indentation step right of a mapping's key and two
      // columns right of a sequence's dash; the text is indented under the rightmost of the two
      // and written if it has the value under both
      const columns =
        ctx.indent === ''
          ? [-1]
          : [ctx.indent.length - ctx.indentStep.length, ctx.indent.length - 2];
      const parentIndent = ' '.repeat(Math.max(0, ...columns));
      const [header, ...lines] = text.split('\n');
      const str = [header, ...lines.map((line) => (line === '' ? '' : parentIndent + line))].join(
        '\n',
      );
      if (columns.every((column) => hasValue(str, value, column))) return str;
    }
    return stringifyString({ ...item, value }, ctx, onComment, onChompKeep);
  },
};

// the YAML library refolds a long flow scalar; a flow scalar is boxed with its source text and
// emitted as that text, its continuation lines re-indented (the white space starting them isn't part
// of the value, YAML 1.2 §7.3), while the text still has the value where it's written
class RawFlowScalar {
  constructor(
    public value: string,
    public text: string,
  ) {}
}

const rawFlowScalarTag: ScalarTag = {
  tag: 'tag:yaml.org,2002:str',
  default: true,
  identify: (value: unknown): boolean => value instanceof RawFlowScalar,
  resolve: (str: string): string => str,
  stringify: (item, ctx, onComment, onChompKeep): string => {
    const { value, text } = item.value as RawFlowScalar;
    const str = text.replace(/\n[ \t]*/g, `\n${ctx.indent}`).replace(/^[ \t]+$/gm, '');
    if (str === stringifyString({ ...item, value }, ctx)) return str;
    // text the library wouldn't write is checked: an implicit key is on one line (YAML 1.2 §7.4.1),
    // and the text has the value in a flow sequence for a key or a node in a flow collection, or on
    // its own
    if (!(ctx.implicitKey && str.includes('\n'))) {
      const inFlow = ctx.inFlow || ctx.implicitKey;
      const doc = parseDocument(inFlow ? `[${str}]\n` : `${str}\n`);
      const parsed = doc.errors.length === 0 ? doc.toJS() : undefined;
      if ((inFlow ? parsed?.[0] : parsed) === value) return str;
    }
    return stringifyString({ ...item, value }, ctx, onComment, onChompKeep);
  },
};

// an alias is boxed and emitted as its text, as the YAML library's alias node requires an anchor the
// library wrote; an implicit key keeps a space before the ':' indicator, which would otherwise be read
// as part of the alias name
class RawAlias {
  constructor(public name: string) {}
}

const rawAliasTag: ScalarTag = {
  tag: 'tag:yaml.org,2002:str',
  default: true,
  identify: (value: unknown): boolean => value instanceof RawAlias,
  resolve: (str: string): string => str,
  stringify: (item, ctx): string =>
    `*${(item.value as RawAlias).name}${ctx.implicitKey ? ' ' : ''}`,
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
  // anchor names written so far, recorded or generated
  anchors: Set<string>;
  // recorded anchor names not written again, as they were already written
  repeatedAnchors: Set<string>;
}

/**
 * Turns an already emitted node into the target of an alias, assigning it an
 * anchor on first use, and returns the alias referring to it.
 */
const toAlias = (node: YAMLNode, context: NodeContext): Alias => {
  if (typeof node.anchor !== 'string') {
    do {
      context.anchorCount += 1;
    } while (context.anchors.has(`a${context.anchorCount}`));
    node.anchor = `a${context.anchorCount}`;
    context.anchors.add(node.anchor);
  }
  return new Alias(node.anchor);
};

// the anchor recorded in style, to be written back; a name already written (repeated in the source,
// or generated for an alias) isn't written again, so that an alias refers to the node it was made for
const claimAnchor = (style: YAMLElementStyle, context: NodeContext): string | undefined => {
  if (style.anchor === undefined) return undefined;
  if (context.anchors.has(style.anchor)) {
    context.repeatedAnchors.add(style.anchor);
    return undefined;
  }
  context.anchors.add(style.anchor);
  return style.anchor;
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
    applyTag(map, element, style);
    map.anchor = claimAnchor(style, context);

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
    applyTag(seq, element, style);
    seq.anchor = claimAnchor(style, context);

    element.forEach((item) => {
      const itemNode = toYAMLNode(item, context);
      // a single pair in a sequence (e.g. [a: 1]) is written back as that pair, with the mapping's
      // comments; not when aliasing, as an alias needs the mapping node, and not for a key that's
      // too long to be implicit (1024 characters, YAML 1.2 §7.4.1, with room for quoting), as the
      // YAML library writes a pair in a sequence only with an implicit key
      const pair =
        itemNode instanceof YAMLMap && itemNode.items.length === 1 ? itemNode.items[0] : undefined;
      if (
        isNode(pair?.value) &&
        !emitted &&
        isObjectElement(item) &&
        String(item.keys()[0]).length <= 1000 &&
        getStyle(item).singlePair
      ) {
        if (isNode(pair.key)) pair.key.commentBefore ??= (itemNode as YAMLMap).commentBefore;
        pair.value.comment ??= (itemNode as YAMLMap).comment;
        seq.items.push(pair);
      } else {
        seq.items.push(itemNode);
      }
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

  // an alias isn't resolved, so its element has the alias text; it's written back as an alias while
  // it still has that text and its anchor was written before it only once, so that it refers to the
  // node it referred to in the source
  if (
    style.alias !== undefined &&
    toValue(element) === `*${style.alias}` &&
    context.anchors.has(style.alias) &&
    !context.repeatedAnchors.has(style.alias)
  ) {
    const alias = new Scalar(new RawAlias(style.alias));
    applyComments(alias, style);
    return alias;
  }

  // scalar element (string, number, boolean, null)
  const scalarType = style.scalarStyle ? scalarStyleMap[style.scalarStyle] : undefined;

  const scalar = new Scalar(toValue(element));
  // an empty node (YAML 1.2 §7.2) is serialized to null; while it's still empty, write it back as
  // it was written: with no content, after its anchor and tag if it had them
  const isEmptyNode = scalar.value === null && includesClasses(element, ['yaml-e-node']);
  if (isEmptyNode) {
    const anchor = claimAnchor(style, context);
    const properties = [anchor && `&${anchor}`, style.tag].filter(Boolean).join(' ');
    if (properties) {
      scalar.value = new EmptyNodeProperties(properties);
    } else {
      scalar.value = null;
      scalar.source = '';
    }
  }
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

  if (
    (style.scalarStyle === 'Literal' || style.scalarStyle === 'Folded') &&
    typeof style.rawContent === 'string' &&
    typeof scalar.value === 'string'
  ) {
    const text = style.rawContent.replace(/\r\n/g, '\n').replace(/\n$/, '');
    scalar.value = new RawBlockScalar(scalar.value, text);
  }

  if (
    style.styleGroup === 'Flow' &&
    typeof style.rawContent === 'string' &&
    typeof scalar.value === 'string' &&
    scalar.value !== ''
  ) {
    scalar.value = new RawFlowScalar(scalar.value, style.rawContent.replace(/\r\n/g, '\n'));
  }

  applyComments(scalar, style);
  if (!isEmptyNode) {
    applyTag(scalar, element, style);
    scalar.anchor = claimAnchor(style, context);
  }
  if (scalar.tag !== undefined && scalar.value === '' && style.scalarStyle === 'Plain') {
    // an empty plain string has no content to write, so it's written like a tagged empty node,
    // which parses back to the same empty string
    scalar.value = new EmptyNodeProperties(scalar.tag);
    scalar.tag = undefined;
  } else if (scalar.tag !== undefined && typeof scalar.value === 'string') {
    scalar.value = new TaggedString(scalar.value);
  }

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
    if (options.indentSeq === undefined && typeof style.indentSeq === 'boolean') {
      allOptions.indentSeq = style.indentSeq;
    }

    const rootNode = toYAMLNode(element, {
      ancestors: new WeakSet(),
      emitted: aliasDuplicateObjects ? new Map() : undefined,
      anchorCount: 0,
      anchors: new Set(),
      repeatedAnchors: new Set(),
    });
    const doc = new Document(undefined, {
      ...allOptions,
      customTags: [
        rawNumberTag,
        taggedStringTag,
        emptyNodePropertiesTag,
        rawBlockScalarTag,
        rawFlowScalarTag,
        rawAliasTag,
      ],
    });
    doc.contents = rootNode as YAMLNode;
    const { documentComment } = getStyle(element);
    if (documentComment) doc.comment = documentComment;

    if (directive) {
      doc.directives!.yaml.explicit = true;
    }

    return doc.toString(allOptions);
  }

  if (directive) {
    const doc = new Document(toValue(element), createCycleSafeReplacer(), allOptions);
    doc.directives!.yaml.explicit = true;
    return doc.toString(allOptions);
  }

  return stringify(toValue(element), createCycleSafeReplacer(), allOptions);
};

export default serializer;
