import {
  Document,
  stringify,
  Scalar,
  YAMLMap,
  YAMLSeq,
  Pair,
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

// map our scalarStyle strings to yaml library Scalar.Type constants
const scalarStyleMap: Record<string, Scalar.Type> = {
  Plain: Scalar.PLAIN,
  SingleQuoted: Scalar.QUOTE_SINGLE,
  DoubleQuoted: Scalar.QUOTE_DOUBLE,
  Literal: Scalar.BLOCK_LITERAL,
  Folded: Scalar.BLOCK_FOLDED,
};

/**
 * @public
 */
export interface YamlSerializerOptions
  extends
    DocumentOptions,
    Pick<CreateNodeOptions, 'aliasDuplicateObjects'>,
    Pick<SchemaOptions, 'sortMapEntries'>,
    ToStringOptions {
  /** Include %YAML directive and document marker */
  directive?: boolean;
  /** Preserve original formatting styles from element.style.yaml */
  preserveStyle?: boolean;
}

/**
 * Converts an ApiDOM element tree to yaml library AST nodes,
 * preserving style information from element.style.yaml.
 */
const toYamlNode = (element: unknown, visited: WeakSet<object>): unknown => {
  if (!isElement(element)) return element;

  // cycle detection
  if (visited.has(element as object)) return undefined;
  visited.add(element as object);

  const yamlStyle = (element.style?.yaml ?? {}) as Record<string, unknown>;

  if (isObjectElement(element)) {
    const map = new YAMLMap();
    map.flow = yamlStyle.styleGroup === 'Flow';

    if (yamlStyle.comment) map.comment = yamlStyle.comment as string;
    if (yamlStyle.commentBefore) map.commentBefore = yamlStyle.commentBefore as string;

    element.forEach((value, key, member) => {
      const memberStyle = (isMemberElement(member) ? (member.style?.yaml ?? {}) : {}) as Record<
        string,
        unknown
      >;
      const keyNode = toYamlNode(key, visited);
      const valueNode = toYamlNode(value, visited);
      const pair = new Pair(keyNode, valueNode);

      if (memberStyle.commentBefore && keyNode != null && typeof keyNode === 'object') {
        (keyNode as { commentBefore?: string }).commentBefore = memberStyle.commentBefore as string;
      }
      if (memberStyle.comment && valueNode != null && typeof valueNode === 'object') {
        (valueNode as { comment?: string }).comment = memberStyle.comment as string;
      }

      map.items.push(pair);
    });

    return map;
  }

  if (isArrayElement(element)) {
    const seq = new YAMLSeq();
    seq.flow = yamlStyle.styleGroup === 'Flow';

    if (yamlStyle.comment) seq.comment = yamlStyle.comment as string;
    if (yamlStyle.commentBefore) seq.commentBefore = yamlStyle.commentBefore as string;

    element.forEach((item) => {
      seq.items.push(toYamlNode(item, visited));
    });

    return seq;
  }

  if (isRefElement(element)) {
    return new Scalar(String(element.toValue()));
  }

  if (isLinkElement(element)) {
    return new Scalar(isStringElement(element.href) ? element.href.toValue() : '');
  }

  // scalar element (string, number, boolean, null)
  const scalarStyle = yamlStyle.scalarStyle as string | undefined;
  const scalarType = scalarStyle ? scalarStyleMap[scalarStyle] : undefined;

  const scalar = new Scalar(element.toValue());
  if (scalarType) {
    scalar.type = scalarType;
  }
  if (yamlStyle.comment) scalar.comment = yamlStyle.comment as string;
  if (yamlStyle.commentBefore) scalar.commentBefore = yamlStyle.commentBefore as string;

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
  }: YamlSerializerOptions = {},
): string => {
  const allOptions = { aliasDuplicateObjects, ...options };

  if (preserveStyle) {
    // read style options from element if not explicitly provided
    const yamlStyle = (element.style?.yaml ?? {}) as Record<string, unknown>;
    if (options.indent === undefined && typeof yamlStyle.indent === 'number') {
      allOptions.indent = yamlStyle.indent;
    }
    if (typeof yamlStyle.flowCollectionPadding === 'boolean') {
      (allOptions as Record<string, unknown>).flowCollectionPadding =
        yamlStyle.flowCollectionPadding;
    }

    const rootNode = toYamlNode(element, new WeakSet());
    const doc = new Document(undefined, allOptions);
    // @ts-ignore - set contents directly to our custom AST
    doc.contents = rootNode;

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
