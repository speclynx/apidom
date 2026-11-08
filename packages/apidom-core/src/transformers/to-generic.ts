import { clone } from 'ramda';
import {
  Element,
  ObjectElement,
  ArrayElement,
  MemberElement,
  StringElement,
  NumberElement,
  BooleanElement,
  NullElement,
  SourceMapElement,
  isMemberElement,
  isObjectElement,
  isArrayElement,
  isStringElement,
  isNumberElement,
  isBooleanElement,
  isNullElement,
  hasElementSourceMap,
  cloneDeep,
} from '@speclynx/apidom-datamodel';

const convert = (element: Element, visited: WeakMap<Element, Element>): Element => {
  const converted = visited.get(element);
  if (converted !== undefined) return converted;

  let generic: Element;

  if (isMemberElement(element)) {
    const member = new MemberElement();
    visited.set(element, member);
    if (element.key !== undefined) member.key = convert(element.key as Element, visited);
    if (element.value !== undefined) member.value = convert(element.value as Element, visited);
    generic = member;
  } else if (isObjectElement(element)) {
    generic = new ObjectElement();
    visited.set(element, generic);
    generic.content = (element.content as Element[]).map((item) => convert(item, visited));
  } else if (isArrayElement(element)) {
    generic = new ArrayElement();
    visited.set(element, generic);
    generic.content = (element.content as Element[]).map((item) => convert(item, visited));
  } else if (isStringElement(element)) {
    generic = new StringElement(element.content as string);
    visited.set(element, generic);
  } else if (isNumberElement(element)) {
    generic = new NumberElement(element.content as number);
    visited.set(element, generic);
  } else if (isBooleanElement(element)) {
    generic = new BooleanElement(element.content as boolean);
    visited.set(element, generic);
  } else if (isNullElement(element)) {
    generic = new NullElement();
    visited.set(element, generic);
  } else {
    // elements without a generic counterpart (e.g. RefElement) are copied as they are, descendants included
    generic = cloneDeep(element);
    visited.set(element, generic);
    return generic;
  }

  if (!element.isMetaEmpty) generic.meta = cloneDeep(element.meta);
  if (!element.isAttributesEmpty) generic.attributes = cloneDeep(element.attributes);
  if (hasElementSourceMap(element)) SourceMapElement.transfer(element, generic);
  if (element.style !== undefined) generic.style = clone(element.style);

  return generic;
};

/**
 * Transforms ApiDOM into generic ApiDOM: every element, including the descendants, becomes
 * the primitive element (object, array, member, string, number, boolean, null) of its kind.
 * Elements without a primitive counterpart (e.g. RefElement) are deep copied as they are.
 * Meta, attributes, source maps and style are kept; meta and attributes are deep copied,
 * not transformed. Elements shared between several places, and cycles, are kept shared
 * and cyclic. The transformation is recursive, so its nesting depth is limited by the call
 * stack. The element itself is not modified.
 *
 * Generic ApiDOM can be refracted again, e.g. to read a semantic element as a different type.
 * @public
 */
const toGeneric = <T extends Element = Element>(element: Element): T =>
  convert(element, new WeakMap()) as T;

export default toGeneric;
