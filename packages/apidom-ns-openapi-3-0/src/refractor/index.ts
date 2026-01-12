import { resolveSpecification, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { Element, refract as baseRefract } from '@speclynx/apidom-datamodel';
import { traverse, getNodePrimitiveType } from '@speclynx/apidom-traverse';
import { path } from 'ramda';

import type VisitorClass from './visitors/Visitor.ts';
import specification from './specification.ts';
import createToolbox, { type Toolbox } from './toolbox.ts';
import type CallbackElement from '../elements/Callback.ts';
import type ComponentsElement from '../elements/Components.ts';
import type ContactElement from '../elements/Contact.ts';
import type DiscriminatorElement from '../elements/Discriminator.ts';
import type EncodingElement from '../elements/Encoding.ts';
import type ExampleElement from '../elements/Example.ts';
import type ExternalDocumentationElement from '../elements/ExternalDocumentation.ts';
import type HeaderElement from '../elements/Header.ts';
import type InfoElement from '../elements/Info.ts';
import type LicenseElement from '../elements/License.ts';
import type LinkElement from '../elements/Link.ts';
import type MediaTypeElement from '../elements/MediaType.ts';
import type OAuthFlowElement from '../elements/OAuthFlow.ts';
import type OAuthFlowsElement from '../elements/OAuthFlows.ts';
import type OpenApi3_0Element from '../elements/OpenApi3-0.ts';
import type OperationElement from '../elements/Operation.ts';
import type ParameterElement from '../elements/Parameter.ts';
import type PathItemElement from '../elements/PathItem.ts';
import type PathsElement from '../elements/Paths.ts';
import type ReferenceElement from '../elements/Reference.ts';
import type RequestBodyElement from '../elements/RequestBody.ts';
import type ResponseElement from '../elements/Response.ts';
import type ResponsesElement from '../elements/Responses.ts';
import type SchemaElement from '../elements/Schema.ts';
import type SecurityRequirementElement from '../elements/SecurityRequirement.ts';
import type SecuritySchemeElement from '../elements/SecurityScheme.ts';
import type ServerElement from '../elements/Server.ts';
import type ServerVariableElement from '../elements/ServerVariable.ts';
import type TagElement from '../elements/Tag.ts';
import type XmlElement from '../elements/Xml.ts';

/**
 * @public
 */
export type RefractorPlugin = (toolbox: Toolbox) => {
  visitor?: object;
  pre?: () => void;
  post?: () => void;
};

/**
 * @public
 */
export interface RefractorOptions {
  readonly element?: string;
  readonly plugins?: RefractorPlugin[];
  readonly specificationObj?: typeof specification;
}

/**
 * @public
 */
const refract = <T extends Element>(
  value: unknown,
  { element = 'openApi3_0', plugins = [], specificationObj = specification }: RefractorOptions = {},
): T => {
  const genericElement = baseRefract(value);
  const resolvedSpec = resolveSpecification(specificationObj);
  const elementMap = resolvedSpec.elementMap as Record<string, string[]>;
  const specPath = elementMap[element];

  if (!specPath) {
    throw new Error(`Unknown element type: "${element}"`);
  }

  /**
   * This is where generic ApiDOM becomes semantic (namespace applied).
   * We don't allow consumers to hook into this translation.
   * Though we allow consumers to define their own plugins on already transformed ApiDOM.
   */
  const RootVisitorClass = path(specPath, resolvedSpec) as typeof VisitorClass;
  const rootVisitor = new RootVisitorClass({ specObj: resolvedSpec });

  traverse(genericElement, rootVisitor, { nodeTypeGetter: getNodePrimitiveType });

  /**
   * Running plugins visitors means extra single traversal === performance hit.
   */
  return dispatchRefractorPlugins(rootVisitor.element, plugins, {
    toolboxCreator: createToolbox,
  }) as T;
};

/**
 * Refracts a value into an OpenApi3_0Element.
 * @public
 */
export const refractOpenApi3_0 = <T extends Element = OpenApi3_0Element>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'openApi3_0' });

/**
 * Refracts a value into an InfoElement.
 * @public
 */
export const refractInfo = <T extends Element = InfoElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'info' });

/**
 * Refracts a value into a ContactElement.
 * @public
 */
export const refractContact = <T extends Element = ContactElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'contact' });

/**
 * Refracts a value into a LicenseElement.
 * @public
 */
export const refractLicense = <T extends Element = LicenseElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'license' });

/**
 * Refracts a value into a ServerElement.
 * @public
 */
export const refractServer = <T extends Element = ServerElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'server' });

/**
 * Refracts a value into a ServerVariableElement.
 * @public
 */
export const refractServerVariable = <T extends Element = ServerVariableElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'serverVariable' });

/**
 * Refracts a value into a ComponentsElement.
 * @public
 */
export const refractComponents = <T extends Element = ComponentsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'components' });

/**
 * Refracts a value into a PathsElement.
 * @public
 */
export const refractPaths = <T extends Element = PathsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'paths' });

/**
 * Refracts a value into a PathItemElement.
 * @public
 */
export const refractPathItem = <T extends Element = PathItemElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'pathItem' });

/**
 * Refracts a value into an OperationElement.
 * @public
 */
export const refractOperation = <T extends Element = OperationElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'operation' });

/**
 * Refracts a value into an ExternalDocumentationElement.
 * @public
 */
export const refractExternalDocumentation = <T extends Element = ExternalDocumentationElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'externalDocumentation' });

/**
 * Refracts a value into a ParameterElement.
 * @public
 */
export const refractParameter = <T extends Element = ParameterElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'parameter' });

/**
 * Refracts a value into a RequestBodyElement.
 * @public
 */
export const refractRequestBody = <T extends Element = RequestBodyElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'requestBody' });

/**
 * Refracts a value into a MediaTypeElement.
 * @public
 */
export const refractMediaType = <T extends Element = MediaTypeElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mediaType' });

/**
 * Refracts a value into an EncodingElement.
 * @public
 */
export const refractEncoding = <T extends Element = EncodingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'encoding' });

/**
 * Refracts a value into a ResponsesElement.
 * @public
 */
export const refractResponses = <T extends Element = ResponsesElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'responses' });

/**
 * Refracts a value into a ResponseElement.
 * @public
 */
export const refractResponse = <T extends Element = ResponseElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'response' });

/**
 * Refracts a value into a CallbackElement.
 * @public
 */
export const refractCallback = <T extends Element = CallbackElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'callback' });

/**
 * Refracts a value into an ExampleElement.
 * @public
 */
export const refractExample = <T extends Element = ExampleElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'example' });

/**
 * Refracts a value into a LinkElement.
 * @public
 */
export const refractLink = <T extends Element = LinkElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'link' });

/**
 * Refracts a value into a HeaderElement.
 * @public
 */
export const refractHeader = <T extends Element = HeaderElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'header' });

/**
 * Refracts a value into a TagElement.
 * @public
 */
export const refractTag = <T extends Element = TagElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'tag' });

/**
 * Refracts a value into a ReferenceElement.
 * @public
 */
export const refractReference = <T extends Element = ReferenceElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'reference' });

/**
 * Refracts a value into a SchemaElement.
 * @public
 */
export const refractSchema = <T extends Element = SchemaElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'schema' });

/**
 * Refracts a value into a DiscriminatorElement.
 * @public
 */
export const refractDiscriminator = <T extends Element = DiscriminatorElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'discriminator' });

/**
 * Refracts a value into an XmlElement.
 * @public
 */
export const refractXml = <T extends Element = XmlElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'xml' });

/**
 * Refracts a value into a SecuritySchemeElement.
 * @public
 */
export const refractSecurityScheme = <T extends Element = SecuritySchemeElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'securityScheme' });

/**
 * Refracts a value into an OAuthFlowsElement.
 * @public
 */
export const refractOAuthFlows = <T extends Element = OAuthFlowsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'oAuthFlows' });

/**
 * Refracts a value into an OAuthFlowElement.
 * @public
 */
export const refractOAuthFlow = <T extends Element = OAuthFlowElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'oAuthFlow' });

/**
 * Refracts a value into a SecurityRequirementElement.
 * @public
 */
export const refractSecurityRequirement = <T extends Element = SecurityRequirementElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'securityRequirement' });

export default refract;
