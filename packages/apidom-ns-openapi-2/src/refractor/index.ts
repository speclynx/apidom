import { visit, resolveSpecification, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { Element, refract as baseRefract } from '@speclynx/apidom-datamodel';
import { path } from 'ramda';

import type VisitorClass from './visitors/Visitor.ts';
import specification from './specification.ts';
import { keyMap, getNodeType } from '../traversal/visitor.ts';
import createToolbox, { type Toolbox } from './toolbox.ts';
import type SwaggerElement from '../elements/Swagger.ts';
import type InfoElement from '../elements/Info.ts';
import type ContactElement from '../elements/Contact.ts';
import type LicenseElement from '../elements/License.ts';
import type PathsElement from '../elements/Paths.ts';
import type PathItemElement from '../elements/PathItem.ts';
import type OperationElement from '../elements/Operation.ts';
import type ExternalDocumentationElement from '../elements/ExternalDocumentation.ts';
import type ParameterElement from '../elements/Parameter.ts';
import type ItemsElement from '../elements/Items.ts';
import type ResponsesElement from '../elements/Responses.ts';
import type ResponseElement from '../elements/Response.ts';
import type HeadersElement from '../elements/Headers.ts';
import type ExampleElement from '../elements/Example.ts';
import type HeaderElement from '../elements/Header.ts';
import type TagElement from '../elements/Tag.ts';
import type ReferenceElement from '../elements/Reference.ts';
import type SchemaElement from '../elements/Schema.ts';
import type XmlElement from '../elements/Xml.ts';
import type DefinitionsElement from '../elements/Definitions.ts';
import type ParametersDefinitionsElement from '../elements/ParametersDefinitions.ts';
import type ResponsesDefinitionsElement from '../elements/ResponsesDefinitions.ts';
import type SecurityDefinitionsElement from '../elements/SecurityDefinitions.ts';
import type SecuritySchemeElement from '../elements/SecurityScheme.ts';
import type ScopesElement from '../elements/Scopes.ts';
import type SecurityRequirementElement from '../elements/SecurityRequirement.ts';

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
  { element = 'swagger', plugins = [], specificationObj = specification }: RefractorOptions = {},
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

  visit(genericElement, rootVisitor);

  /**
   * Running plugins visitors means extra single traversal === performance hit.
   */
  return dispatchRefractorPlugins(rootVisitor.element, plugins, {
    toolboxCreator: createToolbox,
    visitorOptions: { keyMap, nodeTypeGetter: getNodeType },
  }) as T;
};

/**
 * Refracts a value into a SwaggerElement.
 * @public
 */
export const refractSwagger = <T extends Element = SwaggerElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'swagger' });

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
 * Refracts a value into an ItemsElement.
 * @public
 */
export const refractItems = <T extends Element = ItemsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'items' });

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
 * Refracts a value into a HeadersElement.
 * @public
 */
export const refractHeaders = <T extends Element = HeadersElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'headers' });

/**
 * Refracts a value into an ExampleElement.
 * @public
 */
export const refractExample = <T extends Element = ExampleElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'example' });

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
 * Refracts a value into an XmlElement.
 * @public
 */
export const refractXml = <T extends Element = XmlElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'xml' });

/**
 * Refracts a value into a DefinitionsElement.
 * @public
 */
export const refractDefinitions = <T extends Element = DefinitionsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'definitions' });

/**
 * Refracts a value into a ParametersDefinitionsElement.
 * @public
 */
export const refractParametersDefinitions = <T extends Element = ParametersDefinitionsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'parametersDefinitions' });

/**
 * Refracts a value into a ResponsesDefinitionsElement.
 * @public
 */
export const refractResponsesDefinitions = <T extends Element = ResponsesDefinitionsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'responsesDefinitions' });

/**
 * Refracts a value into a SecurityDefinitionsElement.
 * @public
 */
export const refractSecurityDefinitions = <T extends Element = SecurityDefinitionsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'securityDefinitions' });

/**
 * Refracts a value into a SecuritySchemeElement.
 * @public
 */
export const refractSecurityScheme = <T extends Element = SecuritySchemeElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'securityScheme' });

/**
 * Refracts a value into a ScopesElement.
 * @public
 */
export const refractScopes = <T extends Element = ScopesElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'scopes' });

/**
 * Refracts a value into a SecurityRequirementElement.
 * @public
 */
export const refractSecurityRequirement = <T extends Element = SecurityRequirementElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'securityRequirement' });

export default refract;
