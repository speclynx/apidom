import {
  Element,
  type Meta,
  type Attributes,
  isArrayElement,
  isElement,
  isMemberElement,
  includesClasses,
  cloneDeep,
  SourceMapElement,
  StyleElement,
} from '@speclynx/apidom-datamodel';
import { Path, getNodeType } from '@speclynx/apidom-traverse';
import { toValue } from '@speclynx/apidom-core';

/**
 * Overlay 1.x.y specification elements.
 */
import InfoElement from '../../elements/Info.ts';
import ActionElement from '../../elements/Action.ts';
import ComponentsElement from '../../elements/Components.ts';
import ReusableActionElement from '../../elements/ReusableAction.ts';
import Actions from '../../elements/nces/Actions.ts';
import ComponentsActions from '../../elements/nces/ComponentsActions.ts';

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
 * overlay: 1.1.0
 * info:
 * ```
 * Refracting result without this plugin:
 *
 *  (Overlay1Element
 *    (MemberElement
 *      (StringElement)
 *      (OverlayElement))
 *    (MemberElement
 *      (StringElement)
 *      (NullElement))
 *
 * Refracting result with this plugin:
 *
 *  (Overlay1Element
 *    (MemberElement
 *      (StringElement)
 *      (OverlayElement))
 *    (MemberElement
 *      (StringElement)
 *      (InfoElement))
 */

type ElementFactory = (
  content?: Record<string, unknown>,
  meta?: Meta,
  attributes?: Attributes,
) => Element;

const schema: Record<string, Record<string, ElementFactory>> = {
  // concrete types handling (CTs)
  Overlay1Element: {
    info: (content, meta, attributes) => new InfoElement(content, meta, attributes),
    actions: (content, meta, attributes) =>
      new Actions(content as unknown as Array<unknown> | undefined, meta, attributes),
    components: (content, meta, attributes) => new ComponentsElement(content, meta, attributes),
  },
  ComponentsElement: {
    actions: (content, meta, attributes) => new ComponentsActions(content, meta, attributes),
  },
  ReusableActionElement: {
    fields: (content, meta, attributes) => new ActionElement(content, meta, attributes),
  },
  // non-concrete types handling (NCEs)
  [Actions.primaryClass]: {
    '<*>': (content, meta, attributes) => new ActionElement(content, meta, attributes),
  },
  [ComponentsActions.primaryClass]: {
    '[key: *]': (content, meta, attributes) => new ReusableActionElement(content, meta, attributes),
  },
};

const findElementFactory = (ancestor: Element, keyName: string): ElementFactory | undefined => {
  const elementType = getNodeType(ancestor);
  const classType = ancestor.isMetaEmpty ? undefined : ancestor.classes.at(0);
  const keyMapping = schema[elementType as string] || schema[classType as string];

  if (typeof keyMapping === 'undefined') return undefined;

  return Object.hasOwn(keyMapping, '[key: *]') ? keyMapping['[key: *]'] : keyMapping[keyName];
};

/**
 * @public
 */
const plugin = () => () => ({
  visitor: {
    enter(path: Path<Element>) {
      const element = path.node;
      if (!includesClasses(element, ['yaml-e-node', 'yaml-e-scalar'])) return;

      const ancestors = path.getAncestorNodes().filter(isElement);
      const parentElement = ancestors.at(0); // immediate parent first
      let elementFactory;
      let context;

      if (isArrayElement(parentElement)) {
        context = element;
        elementFactory = findElementFactory(parentElement, '<*>');
      } else if (isMemberElement(parentElement) && parentElement.value === element) {
        // an empty key is the name of its member; only an empty value stands for a missing element
        context = ancestors.at(1); // grandparent
        elementFactory = findElementFactory(context!, toValue(parentElement.key) as string);
      }

      // no element factory found
      if (typeof elementFactory !== 'function') return;

      const replacement = elementFactory(
        undefined,
        element.isMetaEmpty ? undefined : cloneDeep(element.meta),
        element.isAttributesEmpty ? undefined : cloneDeep(element.attributes),
      );
      SourceMapElement.transfer(element, replacement);
      StyleElement.transfer(element, replacement);
      path.replaceWith(replacement);
    },
  },
});

export default plugin;
