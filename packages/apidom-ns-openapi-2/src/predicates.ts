import SwaggerElement from './elements/Swagger.ts';
import SwaggerVersionElement from './elements/SwaggerVersion.ts';
import InfoElement from './elements/Info.ts';
import ContactElement from './elements/Contact.ts';
import LicenseElement from './elements/License.ts';
import PathsElement from './elements/Paths.ts';
import PathItemElement from './elements/PathItem.ts';
import OperationElement from './elements/Operation.ts';
import ExternalDocumentationElement from './elements/ExternalDocumentation.ts';
import ParameterElement from './elements/Parameter.ts';
import ItemsElement from './elements/Items.ts';
import ExampleElement from './elements/Example.ts';
import ResponsesElement from './elements/Responses.ts';
import ResponseElement from './elements/Response.ts';
import HeadersElement from './elements/Headers.ts';
import HeaderElement from './elements/Header.ts';
import TagElement from './elements/Tag.ts';
import ReferenceElement from './elements/Reference.ts';
import SchemaElement from './elements/Schema.ts';
import XmlElement from './elements/Xml.ts';
import DefinitionsElement from './elements/Definitions.ts';
import ParametersDefinitionsElement from './elements/ParametersDefinitions.ts';
import ResponsesDefinitionsElement from './elements/ResponsesDefinitions.ts';
import SecurityDefinitionsElement from './elements/SecurityDefinitions.ts';
import SecuritySchemeElement from './elements/SecurityScheme.ts';
import SecurityRequirementElement from './elements/SecurityRequirement.ts';
import ScopesElement from './elements/Scopes.ts';

/**
 * @public
 */
export const isSwaggerElement = (element: unknown): element is SwaggerElement =>
  element instanceof SwaggerElement;

/**
 * @public
 */
export const isSwaggerVersionElement = (element: unknown): element is SwaggerVersionElement =>
  element instanceof SwaggerVersionElement;

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
export const isContactElement = (element: unknown): element is ContactElement =>
  element instanceof ContactElement;

/**
 * @public
 */
export const isPathsElement = (element: unknown): element is PathsElement =>
  element instanceof PathsElement;

/**
 * @public
 */
export const isPathItemElement = (element: unknown): element is PathItemElement =>
  element instanceof PathItemElement;

/**
 * @public
 */
export const isOperationElement = (element: unknown): element is OperationElement =>
  element instanceof OperationElement;

/**
 * @public
 */
export const isExternalDocumentationElement = (
  element: unknown,
): element is ExternalDocumentationElement => element instanceof ExternalDocumentationElement;

/**
 * @public
 */
export const isParameterElement = (element: unknown): element is ParameterElement =>
  element instanceof ParameterElement;

/**
 * @public
 */
export const isItemsElement = (element: unknown): element is ItemsElement =>
  element instanceof ItemsElement;

/**
 * @public
 */
export const isResponsesElement = (element: unknown): element is ResponsesElement =>
  element instanceof ResponsesElement;

/**
 * @public
 */
export const isResponseElement = (element: unknown): element is ResponseElement =>
  element instanceof ResponseElement;

/**
 * @public
 */
export const isHeadersElement = (element: unknown): element is HeadersElement =>
  element instanceof HeadersElement;

/**
 * @public
 */
export const isExampleElement = (element: unknown): element is ExampleElement =>
  element instanceof ExampleElement;

/**
 * @public
 */
export const isHeaderElement = (element: unknown): element is HeaderElement =>
  element instanceof HeaderElement;

/**
 * @public
 */
export const isTagElement = (element: unknown): element is TagElement =>
  element instanceof TagElement;

/**
 * @public
 */
export const isReferenceElement = (element: unknown): element is ReferenceElement =>
  element instanceof ReferenceElement;

/**
 * @public
 */
export const isSchemaElement = (element: unknown): element is SchemaElement =>
  element instanceof SchemaElement;

/**
 * @public
 */
export const isXmlElement = (element: unknown): element is XmlElement =>
  element instanceof XmlElement;

/**
 * @public
 */
export const isResponsesDefinitionsElement = (
  element: unknown,
): element is ResponsesDefinitionsElement => element instanceof ResponsesDefinitionsElement;

/**
 * @public
 */
export const isSecurityDefinitionsElement = (
  element: unknown,
): element is SecurityDefinitionsElement => element instanceof SecurityDefinitionsElement;

/**
 * @public
 */
export const isDefinitionsElement = (element: unknown): element is DefinitionsElement =>
  element instanceof DefinitionsElement;

/**
 * @public
 */
export const isParametersDefinitionsElement = (
  element: unknown,
): element is ParametersDefinitionsElement => element instanceof ParametersDefinitionsElement;

/**
 * @public
 */
export const isSecuritySchemeElement = (element: unknown): element is SecuritySchemeElement =>
  element instanceof SecuritySchemeElement;

/**
 * @public
 */
export const isScopesElement = (element: unknown): element is ScopesElement =>
  element instanceof ScopesElement;

/**
 * @public
 */
export const isSecurityRequirementElement = (
  element: unknown,
): element is SecurityRequirementElement => element instanceof SecurityRequirementElement;
