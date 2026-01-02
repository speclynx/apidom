import { BooleanElement, isBooleanElement } from '@speclynx/apidom-datamodel';

import CallbackElement from './elements/Callback.ts';
import ComponentsElement from './elements/Components.ts';
import ContactElement from './elements/Contact.ts';
import ExampleElement from './elements/Example.ts';
import ExternalDocumentationElement from './elements/ExternalDocumentation.ts';
import HeaderElement from './elements/Header.ts';
import InfoElement from './elements/Info.ts';
import LicenseElement from './elements/License.ts';
import LinkElement from './elements/Link.ts';
import OpenapiElement from './elements/Openapi.ts';
import OpenApi3_0Element from './elements/OpenApi3-0.ts';
import OperationElement from './elements/Operation.ts';
import ParameterElement from './elements/Parameter.ts';
import PathItemElement from './elements/PathItem.ts';
import PathsElement from './elements/Paths.ts';
import ReferenceElement from './elements/Reference.ts';
import RequestBodyElement from './elements/RequestBody.ts';
import ResponseElement from './elements/Response.ts';
import ResponsesElement from './elements/Responses.ts';
import SchemaElement from './elements/Schema.ts';
import SecurityRequirementElement from './elements/SecurityRequirement.ts';
import SecuritySchemeElement from './elements/SecurityScheme.ts';
import ServerElement from './elements/Server.ts';
import ServerVariableElement from './elements/ServerVariable.ts';
import MediaTypeElement from './elements/MediaType.ts';
// NCE types
import ServersElement from './elements/nces/Servers.ts';

/**
 * @public
 */
export const isCallbackElement = (element: unknown): element is CallbackElement =>
  element instanceof CallbackElement;

/**
 * @public
 */
export const isComponentsElement = (element: unknown): element is ComponentsElement =>
  element instanceof ComponentsElement;

/**
 * @public
 */
export const isContactElement = (element: unknown): element is ContactElement =>
  element instanceof ContactElement;

/**
 * @public
 */
export const isExampleElement = (element: unknown): element is ExampleElement =>
  element instanceof ExampleElement;

/**
 * @public
 */
export const isExternalDocumentationElement = (
  element: unknown,
): element is ExternalDocumentationElement => element instanceof ExternalDocumentationElement;

/**
 * @public
 */
export const isHeaderElement = (element: unknown): element is HeaderElement =>
  element instanceof HeaderElement;

/**
 * @public
 */
export const isInfoElement = (element: unknown): element is InfoElement =>
  element instanceof InfoElement;

/**
 * @public
 */
export const isLicenseElement = (element: unknown): element is LicenseElement =>
  element instanceof LicenseElement;

/**
 * @public
 */
export const isLinkElement = (element: unknown): element is LinkElement =>
  element instanceof LinkElement;

/**
 * @public
 */
export const isOpenapiElement = (element: unknown): element is OpenapiElement =>
  element instanceof OpenapiElement;

/**
 * @public
 */
export const isOpenApi3_0Element = (element: unknown): element is OpenApi3_0Element =>
  element instanceof OpenApi3_0Element;

/**
 * @public
 */
export const isOperationElement = (element: unknown): element is OperationElement =>
  element instanceof OperationElement;

/**
 * @public
 */
export const isParameterElement = (element: unknown): element is ParameterElement =>
  element instanceof ParameterElement;

/**
 * @public
 */
export const isPathItemElement = (element: unknown): element is PathItemElement =>
  element instanceof PathItemElement;

/**
 * @public
 */
export const isPathsElement = (element: unknown): element is PathsElement =>
  element instanceof PathsElement;

/**
 * @public
 */
export const isReferenceElement = (element: unknown): element is ReferenceElement =>
  element instanceof ReferenceElement;

/**
 * @public
 */
export const isRequestBodyElement = (element: unknown): element is RequestBodyElement =>
  element instanceof RequestBodyElement;

/**
 * @public
 */
export const isResponseElement = (element: unknown): element is ResponseElement =>
  element instanceof ResponseElement;

/**
 * @public
 */
export const isResponsesElement = (element: unknown): element is ResponsesElement =>
  element instanceof ResponsesElement;

/**
 * @public
 */
export const isSchemaElement = (element: unknown): element is SchemaElement =>
  element instanceof SchemaElement;

/**
 * @public
 */
export const isBooleanJsonSchemaElement = (element: unknown): element is BooleanElement => {
  return isBooleanElement(element) && element.classes.includes('boolean-json-schema');
};

/**
 * @public
 */
export const isSecurityRequirementElement = (
  element: unknown,
): element is SecurityRequirementElement => element instanceof SecurityRequirementElement;

/**
 * @public
 */
export const isSecuritySchemeElement = (element: unknown): element is SecuritySchemeElement =>
  element instanceof SecuritySchemeElement;

/**
 * @public
 */
export const isServerElement = (element: unknown): element is ServerElement =>
  element instanceof ServerElement;

/**
 * @public
 */
export const isServerVariableElement = (element: unknown): element is ServerVariableElement =>
  element instanceof ServerVariableElement;

/**
 * @public
 */
export const isMediaTypeElement = (element: unknown): element is MediaTypeElement =>
  element instanceof MediaTypeElement;

/**
 * @public
 */
export const isServersElement = (element: unknown): element is ServersElement =>
  element instanceof ServersElement;
