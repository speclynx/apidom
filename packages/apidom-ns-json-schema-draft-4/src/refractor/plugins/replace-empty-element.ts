import {
  ArrayElement,
  ObjectElement,
  StringElement,
  isArrayElement,
  isElement,
  isMemberElement,
  isStringElement,
  includesClasses,
  cloneDeep,
  SourceMapElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path, getNodeType } from '@speclynx/apidom-traverse';

/**
 * JSON Schema Draft 4 specification elements.
 */
import JSONSchemaElement from '../../elements/JSONSchema.ts';
import LinkDescriptionElement from '../../elements/LinkDescription.ts';
import MediaElement from '../../elements/Media.ts';

/**
 * This plugin is specific to YAML 1.2 format, which allows defining key-value pairs
 * with empty key, empty value, or both. If the value is not provided in YAML format,
 * this plugin compensates for this missing value with the most appropriate semantic element type.
 *
 * https://yaml.org/spec/1.2.2/#72-empty-nodes
 *
 * @example
 *
 * ```yaml
 * $schema: http://json-schema.org/draft-04/schema#
 * items:
 * ```
 * Refracting result without this plugin:
 *
 *  (JSONSchemaElement
 *    (MemberElement
 *      (StringElement)
 *      (StringElement))
 *    (MemberElement
 *      (StringElement)
 *      (StringElement))
 *
 * Refracting result with this plugin:
 *
 *  (JSONSchemaElement
 *    (MemberElement
 *      (StringElement)
 *      (StringElement))
 *    (MemberElement
 *      (StringElement)
 *      (JSONSchemaElement))
 */

const isEmptyElement = (element: any) =>
  isStringElement(element) && includesClasses(element, ['yaml-e-node', 'yaml-e-scalar']);

const schema = {
  JSONSchemaDraft4Element: {
    additionalItems(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
    items(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
    required(...args: any[]) {
      const element = new ArrayElement(...args);
      element.classes.push('json-schema-required');
      return element;
    },
    properties(...args: any[]) {
      const element = new ObjectElement(...args);
      element.classes.push('json-schema-properties');
      return element;
    },
    additionalProperties(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
    patternProperties(...args: any[]) {
      const element = new ObjectElement(...args);
      element.classes.push('json-schema-patternProperties');
      return element;
    },
    dependencies(...args: any[]) {
      const element = new ObjectElement(...args);
      element.classes.push('json-schema-dependencies');
      return element;
    },
    enum(...args: any[]) {
      const element = new ArrayElement(...args);
      element.classes.push('json-schema-enum');
      return element;
    },
    allOf(...args: any[]) {
      const element = new ArrayElement(...args);
      element.classes.push('json-schema-allOf');
      return element;
    },
    anyOf(...args: any[]) {
      const element = new ArrayElement(...args);
      element.classes.push('json-schema-anyOf');
      return element;
    },
    oneOf(...args: any[]) {
      const element = new ArrayElement(...args);
      element.classes.push('json-schema-oneOf');
      return element;
    },
    not(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
    definitions(...args: any[]) {
      const element = new ObjectElement(...args);
      element.classes.push('json-schema-definitions');
      return element;
    },
    links(...args: any[]) {
      const element = new ArrayElement(...args);
      element.classes.push('json-schema-links');
      return element;
    },
    media(...args: any[]) {
      return new MediaElement(...args);
    },
  },
  LinkDescriptionElement: {
    targetSchema(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
    schema(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-properties': {
    '[key: *]': function key(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-patternProperties': {
    '[key: *]': function key(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-dependencies': {
    '[key: *]': function key(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-allOf': {
    '<*>': function asterisk(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-anyOf': {
    '<*>': function asterisk(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-oneOf': {
    '<*>': function asterisk(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-definitions': {
    '[key: *]': function key(...args: any[]) {
      return new JSONSchemaElement(...args);
    },
  },
  'json-schema-links': {
    '<*>': function asterisk(...args: any[]) {
      return new LinkDescriptionElement(...args);
    },
  },
};

const findElementFactory = (ancestor: any, keyName: string) => {
  const elementType = getNodeType(ancestor); // @ts-ignore
  const keyMapping = schema[elementType] || schema[toValue(ancestor.classes.first)];

  return typeof keyMapping === 'undefined'
    ? undefined
    : Object.hasOwn(keyMapping, '[key: *]')
      ? keyMapping['[key: *]']
      : keyMapping[keyName];
};

/**
 * @public
 */
const plugin = () => () => ({
  visitor: {
    StringElement(path: Path<StringElement>) {
      const element = path.node;

      if (!isEmptyElement(element)) return;

      // getAncestorNodes() returns [parent, grandparent, ..., root], so reverse to get [root, ..., parent]
      const lineage = path.getAncestorNodes().reverse().filter(isElement);
      const parentElement = lineage.at(-1);
      let elementFactory;
      let context;

      if (isArrayElement(parentElement)) {
        context = element;
        elementFactory = findElementFactory(parentElement, '<*>');
      } else if (isMemberElement(parentElement)) {
        context = lineage.at(-2);
        elementFactory = findElementFactory(context, toValue(parentElement.key) as string);
      }

      // no element factory found
      if (typeof elementFactory !== 'function') return;

      const replacement = elementFactory.call(
        { context },
        undefined,
        cloneDeep(element.meta),
        cloneDeep(element.attributes),
      );

      SourceMapElement.transfer(element, replacement);

      path.replaceWith(replacement);
    },
  },
});

export default plugin;
