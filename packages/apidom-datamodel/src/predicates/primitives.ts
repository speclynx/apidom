import Element from '../primitives/Element.ts';
import StringElement from '../primitives/StringElement.ts';
import NumberElement from '../primitives/NumberElement.ts';
import NullElement from '../primitives/NullElement.ts';
import BooleanElement from '../primitives/BooleanElement.ts';
import ArrayElement from '../primitives/ArrayElement.ts';
import ObjectElement from '../primitives/ObjectElement.ts';
import MemberElement from '../primitives/MemberElement.ts';

/**
 * @public
 */
export const isElement = (element: unknown): element is Element => element instanceof Element;

/**
 * @public
 */
export const isStringElement = (element: unknown): element is StringElement =>
  element instanceof StringElement;

/**
 * @public
 */
export const isNumberElement = (element: unknown): element is NumberElement =>
  element instanceof NumberElement;

/**
 * @public
 */
export const isNullElement = (element: unknown): element is NullElement =>
  element instanceof NullElement;

/**
 * @public
 */
export const isBooleanElement = (element: unknown): element is BooleanElement =>
  element instanceof BooleanElement;

/**
 * @public
 */
export const isArrayElement = (element: unknown): element is ArrayElement =>
  element instanceof ArrayElement;

/**
 * @public
 */
export const isObjectElement = (element: unknown): element is ObjectElement =>
  element instanceof ObjectElement;

/**
 * @public
 */
export const isMemberElement = (element: unknown): element is MemberElement =>
  element instanceof MemberElement;

/**
 * @public
 */
export type PrimitiveElement =
  | ObjectElement
  | ArrayElement
  | BooleanElement
  | NumberElement
  | StringElement
  | NullElement
  | MemberElement;

/**
 * @public
 */
export const isPrimitiveElement = (element: unknown): element is PrimitiveElement =>
  (isObjectElement(element) && element.element === 'object') ||
  (isArrayElement(element) && element.element === 'array') ||
  (isBooleanElement(element) && element.element === 'boolean') ||
  (isNumberElement(element) && element.element === 'number') ||
  (isStringElement(element) && element.element === 'string') ||
  (isNullElement(element) && element.element === 'null') ||
  (isMemberElement(element) && element.element === 'member');
