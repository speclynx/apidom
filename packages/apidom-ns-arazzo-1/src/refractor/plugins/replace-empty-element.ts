import {
  Element,
  type Meta,
  type Attributes,
  isStringElement,
  isArrayElement,
  isElement,
  isMemberElement,
  includesClasses,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { Path, getNodeType } from '@speclynx/apidom-traverse';
import { toValue } from '@speclynx/apidom-core';

/**
 * Arazzo 1.0.1 specification elements.
 */
import InfoElement from '../../elements/Info.ts';

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
 * arazzo: 1.0.1
 * info:
 * ```
 * Refracting result without this plugin:
 *
 *  (ArazzoSpecification1Element
 *    (MemberElement
 *      (StringElement)
 *      (ArazzoElement))
 *    (MemberElement
 *      (StringElement)
 *      (StringElement))
 *
 * Refracting result with this plugin:
 *
 *  (ArazzoSpecification1Element
 *    (MemberElement
 *      (StringElement)
 *      (ArazzoElement))
 *    (MemberElement
 *      (StringElement)
 *      (InfoElement))
 */

type ElementFactory = (
  content?: Record<string, unknown>,
  meta?: Meta,
  attributes?: Attributes,
) => Element;

const isEmptyElement = (element: unknown) =>
  isStringElement(element) && includesClasses(element, ['yaml-e-node', 'yaml-e-scalar']);

const schema: Record<string, Record<string, ElementFactory>> = {
  // concrete types handling (CTs)
  ArazzoSpecification1Element: {
    info: (content, meta, attributes) => new InfoElement(content, meta, attributes),
  },
};

const findElementFactory = (ancestor: Element, keyName: string): ElementFactory | undefined => {
  const elementType = getNodeType(ancestor);
  const keyMapping =
    schema[elementType as string] || schema[toValue(ancestor.classes.first) as string];

  if (typeof keyMapping === 'undefined') return undefined;

  return Object.hasOwn(keyMapping, '[key: *]') ? keyMapping['[key: *]'] : keyMapping[keyName];
};

/**
 * @public
 */
const plugin = () => () => ({
  visitor: {
    StringElement(path: Path<Element>) {
      const element = path.node;
      if (!isEmptyElement(element)) return;

      const ancestors = path.getAncestorNodes().filter(isElement);
      const parentElement = ancestors.at(0); // immediate parent first
      let elementFactory;
      let context;

      if (isArrayElement(parentElement)) {
        context = element;
        elementFactory = findElementFactory(parentElement, '<*>');
      } else if (isMemberElement(parentElement)) {
        context = ancestors.at(1); // grandparent
        elementFactory = findElementFactory(context!, toValue(parentElement.key) as string);
      }

      // no element factory found
      if (typeof elementFactory !== 'function') return;

      const replacement = elementFactory(
        undefined,
        cloneDeep(element.meta),
        cloneDeep(element.attributes),
      );
      path.replaceWith(replacement);
    },
  },
});

export default plugin;
