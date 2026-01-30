import { isBooleanElement, BooleanElement, includesClasses } from '@speclynx/apidom-datamodel';

import JSONSchemaElement from './elements/JSONSchema.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

export { isJSONReferenceElement, isMediaElement } from '@speclynx/apidom-ns-json-schema-draft-4';

/**
 * @public
 */
export const isBooleanJSONSchemaElement = (element: unknown): element is BooleanElement => {
  return isBooleanElement(element) && includesClasses(element, ['boolean-json-schema']);
};

/**
 * @public
 */
export const isJSONSchemaElement = (element: unknown): element is JSONSchemaElement =>
  element instanceof JSONSchemaElement;

/**
 * @public
 */
export const isLinkDescriptionElement = (element: unknown): element is LinkDescriptionElement =>
  element instanceof LinkDescriptionElement;
