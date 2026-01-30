export { default as mediaTypes, OpenAPIMediaTypes } from './media-types.ts';
export type { Format } from './media-types.ts';

export { default } from './namespace.ts';

export { default as refractorPluginReplaceEmptyElement } from './refractor/plugins/replace-empty-element.ts';
export { default as refractorPluginNormalizeParameters } from './refractor/plugins/normalize-parameters.ts';
export type { PluginOptions as RefractorPluginNormalizeParametersOptions } from './refractor/plugins/normalize-parameters.ts';
export { default as refractorPluginNormalizeSecurityRequirements } from './refractor/plugins/normalize-security-requirements.ts';
export type { PluginOptions as RefractorPluginNormalizeSecurityRequirementsOptions } from './refractor/plugins/normalize-security-requirements.ts';
export { default as refractorPluginNormalizeServers } from './refractor/plugins/normalize-servers.ts';
export type { PluginOptions as RefractorPluginNormalizeServersOptions } from './refractor/plugins/normalize-servers.ts';
export { default as refractorPluginNormalizeOperationIds } from './refractor/plugins/normalize-operation-ids.ts';
export type { PluginOptions as RefractorPluginNormalizeOperationIdsOptions } from './refractor/plugins/normalize-operation-ids.ts';
export { default as refractorPluginNormalizeParameterExamples } from './refractor/plugins/normalize-parameter-examples.ts';
export type { PluginOptions as RefractorPluginNormalizeParameterExamplesOptions } from './refractor/plugins/normalize-parameter-examples.ts';
export { default as refractorPluginNormalizeHeaderExamples } from './refractor/plugins/normalize-header-examples/index.ts';
export type { PluginOptions as RefractorPluginNormalizeHeaderExamplesOptions } from './refractor/plugins/normalize-header-examples/index.ts';
export { default as createToolbox } from './refractor/toolbox.ts';
export type { Toolbox, ancestorLineageToJSONPointer } from './refractor/toolbox.ts';
export { default as specificationObj } from './refractor/specification.ts';
export {
  default as refract,
  refractOpenApi3_1,
  refractInfo,
  refractContact,
  refractLicense,
  refractServer,
  refractServerVariable,
  refractComponents,
  refractPaths,
  refractPathItem,
  refractOperation,
  refractExternalDocumentation,
  refractParameter,
  refractRequestBody,
  refractMediaType,
  refractEncoding,
  refractResponses,
  refractResponse,
  refractCallback,
  refractExample,
  refractLink,
  refractHeader,
  refractTag,
  refractReference,
  refractSchema,
  refractDiscriminator,
  refractXml,
  refractSecurityScheme,
  refractOAuthFlows,
  refractOAuthFlow,
  refractSecurityRequirement,
  refractJsonSchemaDialect,
} from './refractor/index.ts';
export type { RefractorOptions, RefractorPlugin } from './refractor/index.ts';

export { AlternatingVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { AlternatingVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { FixedFieldsVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { FixedFieldsVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { MapVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { MapVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { MixedFieldsVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { MixedFieldsVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { PatternedFieldsVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { PatternedFieldsVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { FallbackVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { FallbackVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { SpecificationExtensionVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { SpecificationExtensionVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { SpecificationVisitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { SpecificationVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export { Visitor } from '@speclynx/apidom-ns-openapi-3-0';
export type { VisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';

// Base visitor classes (Mixin combinations)
export {
  BaseSpecificationVisitor,
  BaseFixedFieldsVisitor,
  BaseMapVisitor,
  BaseSchemaVisitor,
} from './refractor/visitors/open-api-3-1/bases.ts';
export type {
  BaseSpecificationVisitorOptions,
  BaseFixedFieldsVisitorOptions,
  BaseMapVisitorOptions,
  BaseSchemaVisitorOptions,
} from './refractor/visitors/open-api-3-1/bases.ts';

export type {
  default as CallbackVisitor,
  CallbackVisitorOptions,
  BaseCallbackVisitor,
} from './refractor/visitors/open-api-3-1/callback/index.ts';
export type {
  ComponentsCallbacksVisitor,
  ComponentsCallbacksVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ComponentsExamplesVisitor,
  ComponentsExamplesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ComponentsHeadersVisitor,
  ComponentsHeadersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ComponentsVisitor,
  ComponentsVisitorOptions,
  BaseComponentsVisitor,
} from './refractor/visitors/open-api-3-1/components/index.ts';
export type {
  ComponentsLinksVisitor,
  ComponentsLinksVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ComponentsParametersVisitor,
  ComponentsParametersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ComponentsRequestBodiesVisitor,
  ComponentsRequestBodiesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ComponentsResponsesVisitor,
  ComponentsResponsesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ComponentsPathItemsVisitor,
  PathItemsVisitorOptions as ComponentsPathItemsVisitorOptions,
} from './refractor/visitors/open-api-3-1/components/PathItemsVisitor.ts';
export type {
  default as ComponentsSchemasVisitor,
  SchemasVisitorOptions as ComponentsSchemasVisitorOptions,
} from './refractor/visitors/open-api-3-1/components/SchemasVisitor.ts';
export type {
  ComponentsSecuritySchemesVisitor,
  ComponentsSecuritySchemesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ContactVisitor,
  ContactVisitorOptions,
  BaseContactVisitor,
} from './refractor/visitors/open-api-3-1/contact/index.ts';
export type {
  default as DiscriminatorVisitor,
  DiscriminatorVisitorOptions,
  BaseDiscriminatorVisitor,
} from './refractor/visitors/open-api-3-1/distriminator/index.ts';
export type {
  DiscriminatorMappingVisitor,
  DiscriminatorMappingVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  EncodingHeadersVisitor,
  EncodingHeadersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as EncodingVisitor,
  EncodingVisitorOptions,
  BaseEncodingVisitor,
} from './refractor/visitors/open-api-3-1/encoding/index.ts';
export type {
  ExampleExternalValueVisitor,
  ExampleExternalValueVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ExampleVisitor,
  ExampleVisitorOptions,
  BaseExampleVisitor,
} from './refractor/visitors/open-api-3-1/example/index.ts';
export type {
  default as ExternalDocumentationVisitor,
  ExternalDocumentationVisitorOptions,
  BaseExternalDocumentationVisitor,
} from './refractor/visitors/open-api-3-1/external-documentation/index.ts';
export type {
  HeaderContentVisitor,
  HeaderContentVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  HeaderExamplesVisitor,
  HeaderExamplesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as HeaderVisitor,
  HeaderVisitorOptions,
  BaseHeaderVisitor,
} from './refractor/visitors/open-api-3-1/header/index.ts';
export type {
  HeaderSchemaVisitor,
  HeaderSchemaVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as InfoVisitor,
  InfoVisitorOptions,
  BaseInfoVisitor,
} from './refractor/visitors/open-api-3-1/info/index.ts';
export type {
  InfoVersionVisitor,
  InfoVersionVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as LicenseVisitor,
  LicenseVisitorOptions,
  BaseLicenseVisitor,
} from './refractor/visitors/open-api-3-1/license/index.ts';
export type {
  default as LinkVisitor,
  LinkVisitorOptions,
  BaseLinkVisitor,
} from './refractor/visitors/open-api-3-1/link/index.ts';
export type {
  LinkOperationIdVisitor,
  LinkOperationIdVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  LinkOperationRefVisitor,
  LinkOperationRefVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  LinkParametersVisitor,
  LinkParametersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  MediaTypeEncodingVisitor,
  MediaTypeEncodingVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  MediaTypeExamplesVisitor,
  MediaTypeExamplesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as MediaTypeVisitor,
  MediaTypeVisitorOptions,
  BaseMediaTypeVisitor,
} from './refractor/visitors/open-api-3-1/media-type/index.ts';
export type {
  MediaTypeSchemaVisitor,
  MediaTypeSchemaVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as OAuthFlowVisitor,
  OAuthFlowVisitorOptions,
  BaseOAuthFlowVisitor,
} from './refractor/visitors/open-api-3-1/oauth-flow/index.ts';
export type {
  OAuthFlowScopesVisitor,
  OAuthFlowScopesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as OAuthFlowsVisitor,
  OAuthFlowsVisitorOptions,
  BaseOAuthFlowsVisitor,
} from './refractor/visitors/open-api-3-1/oauth-flows/index.ts';
export type {
  OperationCallbacksVisitor,
  OperationCallbacksVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as OperationVisitor,
  OperationVisitorOptions,
  BaseOperationVisitor,
} from './refractor/visitors/open-api-3-1/operation/index.ts';
export type {
  OperationParametersVisitor,
  OperationParametersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  OperationRequestBodyVisitor,
  OperationRequestBodyVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  OperationSecurityVisitor,
  OperationSecurityVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  OperationServersVisitor,
  OperationServersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  OperationTagsVisitor,
  OperationTagsVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ParameterContentVisitor,
  ParameterContentVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ParameterExampleVisitor,
  ParameterExamplesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ParameterVisitor,
  ParameterVisitorOptions,
  BaseParameterVisitor,
} from './refractor/visitors/open-api-3-1/parameter/index.ts';
export type {
  ParameterSchemaVisitor,
  ParameterSchemaVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  PathItem$RefVisitor,
  PathItem$RefVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as PathItemVisitor,
  PathItemVisitorOptions,
  BasePathItemVisitor,
} from './refractor/visitors/open-api-3-1/path-item/index.ts';
export type {
  PathItemParametersVisitor,
  PathItemParametersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  PathItemServersVisitor,
  PathItemServersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as PathsVisitor,
  PathsVisitorOptions,
  BasePathsVisitor,
} from './refractor/visitors/open-api-3-1/paths/index.ts';
export type {
  Reference$RefVisitor,
  Reference$RefVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ReferenceVisitor,
  ReferenceVisitorOptions,
  BaseReferenceVisitor,
} from './refractor/visitors/open-api-3-1/reference/index.ts';
export type {
  RequestBodyContentVisitor,
  RequestBodyContentVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as RequestBodyVisitor,
  RequestBodyVisitorOptions,
  BaseRequestBodyVisitor,
} from './refractor/visitors/open-api-3-1/request-body/index.ts';
export type {
  ResponseContentVisitor,
  ResponseContentVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ResponseHeadersVisitor,
  ResponseHeadersVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ResponseVisitor,
  ResponseVisitorOptions,
  BaseResponseVisitor,
} from './refractor/visitors/open-api-3-1/response/index.ts';
export type {
  ResponseLinksVisitor,
  ResponseLinksVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ResponsesDefaultVisitor,
  ResponsesDefaultVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ResponsesVisitor,
  ResponsesVisitorOptions,
  BaseResponsesVisitor,
} from './refractor/visitors/open-api-3-1/responses/index.ts';
export type {
  default as Schema$defsVisitor,
  $defsVisitorOptions as Schema$defsVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/$defsVisitor.ts';
export type { ParentSchemaAwareVisitorOptions } from '@speclynx/apidom-ns-json-schema-2020-12';
export type {
  $refVisitor as Schema$refVisitor,
  $refVisitorOptions as Schema$refVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';
export type {
  $vocabularyVisitor as Schema$vocabularyVisitor,
  $vocabularyVisitorOptions as Schema$vocabularyVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';
export type {
  default as SchemaAllOfVisitor,
  AllOfVisitorOptions as SchemaAllOfVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/AllOfVisitor.ts';
export type {
  default as SchemaAnyOfVisitor,
  AnyOfVisitorOptions as SchemaAnyOfVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/AnyOfVisitor.ts';
export type {
  DependentRequiredVisitor as SchemaDependentRequiredVisitor,
  DependentRequiredVisitorOptions as SchemaDependentRequiredVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';
export type {
  default as SchemaDependentSchemasVisitor,
  DependentSchemasVisitorOptions as SchemaDependentSchemasVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/DependentSchemasVisitor.ts';
export type {
  default as SchemaVisitor,
  SchemaVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/index.ts';
export type {
  default as SchemaOneOfVisitor,
  OneOfVisitorOptions as SchemaOneOfVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/OneOfVisitor.ts';
export type {
  default as SchemaPatternPropertiesVisitor,
  PatternPropertiesVisitorOptions as SchemaPatternPropertiesVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/PatternPropertiesVisitor.ts';
export type {
  default as SchemaPrefixItemsVisitor,
  PrefixItemsVisitorOptions as SchemaPrefixItemsVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/PrefixItemsVisitor.ts';
export type {
  default as SchemaPropertiesVisitor,
  PropertiesVisitorOptions as SchemaPropertiesVisitorOptions,
} from './refractor/visitors/open-api-3-1/schema/PropertiesVisitor.ts';
export type {
  default as SecurityRequirementVisitor,
  SecurityRequirementVisitorOptions,
  BaseSecurityRequirementVisitor,
} from './refractor/visitors/open-api-3-1/security-requirement/index.ts';
export type {
  default as SecuritySchemeVisitor,
  SecuritySchemeVisitorOptions,
  BaseSecuritySchemeVisitor,
} from './refractor/visitors/open-api-3-1/security-scheme/index.ts';
export type {
  default as ServerVisitor,
  ServerVisitorOptions,
  BaseServerVisitor,
} from './refractor/visitors/open-api-3-1/server/index.ts';
export type {
  ServerVariableUrlVisitor,
  ServerVariableUrlVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  ServerVariableVariablesVisitor,
  ServerVariableVariablesVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as ServerVariableVisitor,
  ServerVariableVisitorOptions,
  BaseServerVariableVisitor,
} from './refractor/visitors/open-api-3-1/server-variable/index.ts';
export type {
  default as TagVisitor,
  TagVisitorOptions,
  BaseTagVisitor,
} from './refractor/visitors/open-api-3-1/tag/index.ts';
export type {
  default as XmlVisitor,
  XmlVisitorOptions,
  BaseXMLVisitor,
} from './refractor/visitors/open-api-3-1/xml/index.ts';
export type { ContentVisitor, ContentVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export type { ExamplesVisitor, ExamplesVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export type {
  default as OpenApi3_1Visitor,
  OpenApi3_1VisitorOptions,
} from './refractor/visitors/open-api-3-1/index.ts';
export type {
  default as JsonSchemaDialectVisitor,
  JsonSchemaDialectVisitorOptions,
} from './refractor/visitors/open-api-3-1/JsonSchemaDialectVisitor.ts';
export type {
  default as WebhooksVisitor,
  WebhooksVisitorOptions,
} from './refractor/visitors/open-api-3-1/WebhooksVisitor.ts';
export type {
  default as OpenapiVisitor,
  OpenapiVisitorOptions,
} from './refractor/visitors/open-api-3-1/OpenapiVisitor.ts';
export type { ParametersVisitor, ParametersVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export type { SecurityVisitor, SecurityVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export type { ServersVisitor, ServersVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';
export type { TagsVisitor, TagsVisitorOptions } from '@speclynx/apidom-ns-openapi-3-0';

export type { SpecPath } from '@speclynx/apidom-ns-openapi-3-0';

export {
  isCallbackElement,
  isComponentsElement,
  isInfoElement,
  isJsonSchemaDialectElement,
  isLicenseElement,
  isOpenapiElement,
  isOpenApi3_1Element,
  isOperationElement,
  isParameterElement,
  isPathItemElement,
  isPathItemElementExternal,
  isReferenceElement,
  isReferenceElementExternal,
  isResponseElement,
  isResponsesElement,
  isSchemaElement,
  isBooleanJSONSchemaElement,
  isMediaTypeElement,
  isServerElement,
  isSecurityRequirementElement,
  isSecuritySchemeElement,
  isExternalDocumentationElement,
  isServerVariableElement,
  isContactElement,
  isExampleElement,
  isLinkElement,
  isRequestBodyElement,
  isPathsElement,
} from './predicates.ts';

export {
  isReferenceLikeElement,
  isOpenApiExtension,
  isServerLikeElement,
  isServersElement,
} from '@speclynx/apidom-ns-openapi-3-0';

// OpenAPI 3.1.2 elements
export {
  CallbackElement,
  ComponentsElement,
  ContactElement,
  DiscriminatorElement,
  EncodingElement,
  ExampleElement,
  ExternalDocumentationElement,
  HeaderElement,
  InfoElement,
  JsonSchemaDialectElement,
  LicenseElement,
  LinkElement,
  MediaTypeElement,
  OAuthFlowElement,
  OAuthFlowsElement,
  OpenapiElement,
  OpenApi3_1Element,
  OperationElement,
  ParameterElement,
  PathItemElement,
  PathsElement,
  ReferenceElement,
  RequestBodyElement,
  ResponseElement,
  ResponsesElement,
  SchemaElement,
  SecurityRequirementElement,
  SecuritySchemeElement,
  ServerElement,
  ServerVariableElement,
  TagElement,
  XmlElement,
} from './refractor/inspect.ts';
// NCE types
export {
  ComponentsCallbacksElement,
  ComponentsExamplesElement,
  ComponentsHeadersElement,
  ComponentsLinksElement,
  ComponentsParametersElement,
  ComponentsRequestBodiesElement,
  ComponentsResponsesElement,
  ComponentsSchemasElement,
  ComponentsSecuritySchemesElement,
  DiscriminatorMappingElement,
  EncodingHeadersElement,
  HeaderContentElement,
  HeaderExamplesElement,
  LinkParametersElement,
  MediaTypeEncodingElement,
  MediaTypeExamplesElement,
  OAuthFlowScopesElement,
  OperationCallbacksElement,
  OperationParametersElement,
  OperationSecurityElement,
  OperationServersElement,
  OperationTagsElement,
  ParameterContentElement,
  ParameterExamplesElement,
  PathItemParametersElement,
  PathItemServersElement,
  RequestBodyContentElement,
  ResponseContentElement,
  ResponseHeadersElement,
  ResponseLinksElement,
  SecurityElement,
  ServersElement,
  ServerVariablesElement,
  TagsElement,
} from '@speclynx/apidom-ns-openapi-3-0';
export { default as ComponentsPathItemsElement } from './elements/nces/ComponentsPathItems.ts';
export { default as WebhooksElement } from './elements/nces/Webhooks.ts';
