import JSONSchemaElement from './elements/JSONSchema.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

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
