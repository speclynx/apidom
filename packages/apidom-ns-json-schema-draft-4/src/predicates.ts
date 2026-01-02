import JSONSchemaElement from './elements/JSONSchema.ts';
import JSONReferenceElement from './elements/JSONReference.ts';
import MediaElement from './elements/Media.ts';
import LinkDescriptionElement from './elements/LinkDescription.ts';

/**
 * @public
 */
export const isJSONSchemaElement = (element: unknown): element is JSONSchemaElement =>
  element instanceof JSONSchemaElement;

/**
 * @public
 */
export const isJSONReferenceElement = (element: unknown): element is JSONReferenceElement =>
  element instanceof JSONReferenceElement;

/**
 * @public
 */
export const isMediaElement = (element: unknown): element is MediaElement =>
  element instanceof MediaElement;

/**
 * @public
 */
export const isLinkDescriptionElement = (element: unknown): element is LinkDescriptionElement =>
  element instanceof LinkDescriptionElement;
