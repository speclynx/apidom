import { resolveSpecification, type ResolvedSpecification } from '@speclynx/apidom-core';
import { isPlainObject } from 'ramda-adjunct';

/**
 * OpenAPI 3.0 specification elements.
 */
import CallbackElement from '../elements/Callback.ts';
import ComponentsElement from '../elements/Components.ts';
import ContactElement from '../elements/Contact.ts';
import DiscriminatorElement from '../elements/Discriminator.ts';
import EncodingElement from '../elements/Encoding.ts';
import ExampleElement from '../elements/Example.ts';
import ExternalDocumentationElement from '../elements/ExternalDocumentation.ts';
import HeaderElement from '../elements/Header.ts';
import InfoElement from '../elements/Info.ts';
import LicenseElement from '../elements/License.ts';
import LinkElement from '../elements/Link.ts';
import MediaTypeElement from '../elements/MediaType.ts';
import OAuthFlowElement from '../elements/OAuthFlow.ts';
import OAuthFlowsElement from '../elements/OAuthFlows.ts';
import OpenapiElement from '../elements/Openapi.ts';
import OpenApi3_0Element from '../elements/OpenApi3-0.ts';
import OperationElement from '../elements/Operation.ts';
import ParameterElement from '../elements/Parameter.ts';
import PathItemElement from '../elements/PathItem.ts';
import PathsElement from '../elements/Paths.ts';
import ReferenceElement from '../elements/Reference.ts';
import RequestBodyElement from '../elements/RequestBody.ts';
import ResponseElement from '../elements/Response.ts';
import ResponsesElement from '../elements/Responses.ts';
import SchemaElement from '../elements/Schema.ts';
import SecurityRequirementElement from '../elements/SecurityRequirement.ts';
import SecuritySchemeElement from '../elements/SecurityScheme.ts';
import ServerElement from '../elements/Server.ts';
import ServerVariableElement from '../elements/ServerVariable.ts';
import TagElement from '../elements/Tag.ts';
import XmlElement from '../elements/Xml.ts';
import specification from './specification.ts';

/**
 * @public
 */
export interface FixedField {
  name: string;
  alias?: string;
  $visitor: unknown;
}

interface ResolvedSpec extends ResolvedSpecification {
  visitors: {
    document: {
      objects: Record<string, { fixedFields: Record<string, unknown> }>;
    };
  };
}

// Resolve specification to dereference $ref pointers
const resolvedSpec = resolveSpecification<ResolvedSpec>(specification);

// Extract fixed fields as list of { name, alias?, $visitor }
const getFixedFields = (fixedFieldsSpec: Record<string, unknown>): FixedField[] => {
  return Object.entries(fixedFieldsSpec).map(([name, fieldSpec]) => {
    if (isPlainObject(fieldSpec)) {
      return { name, ...fieldSpec } as FixedField;
    }
    return { name, $visitor: fieldSpec };
  });
};

// OpenAPI 3.0 specification elements
Object.defineProperty(OpenApi3_0Element, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.OpenApi.fixedFields),
  enumerable: true,
});

Object.defineProperty(InfoElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Info.fixedFields),
  enumerable: true,
});

Object.defineProperty(ContactElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Contact.fixedFields),
  enumerable: true,
});

Object.defineProperty(LicenseElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.License.fixedFields),
  enumerable: true,
});

Object.defineProperty(ServerElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Server.fixedFields),
  enumerable: true,
});

Object.defineProperty(ServerVariableElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.ServerVariable.fixedFields),
  enumerable: true,
});

Object.defineProperty(ComponentsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Components.fixedFields),
  enumerable: true,
});

Object.defineProperty(PathItemElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.PathItem.fixedFields),
  enumerable: true,
});

Object.defineProperty(OperationElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Operation.fixedFields),
  enumerable: true,
});

Object.defineProperty(ExternalDocumentationElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.ExternalDocumentation.fixedFields),
  enumerable: true,
});

Object.defineProperty(ParameterElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Parameter.fixedFields),
  enumerable: true,
});

Object.defineProperty(RequestBodyElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.RequestBody.fixedFields),
  enumerable: true,
});

Object.defineProperty(MediaTypeElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.MediaType.fixedFields),
  enumerable: true,
});

Object.defineProperty(EncodingElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Encoding.fixedFields),
  enumerable: true,
});

Object.defineProperty(ResponsesElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Responses.fixedFields),
  enumerable: true,
});

Object.defineProperty(ResponseElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Response.fixedFields),
  enumerable: true,
});

Object.defineProperty(ExampleElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Example.fixedFields),
  enumerable: true,
});

Object.defineProperty(LinkElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Link.fixedFields),
  enumerable: true,
});

Object.defineProperty(HeaderElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Header.fixedFields),
  enumerable: true,
});

Object.defineProperty(TagElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Tag.fixedFields),
  enumerable: true,
});

Object.defineProperty(ReferenceElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Reference.fixedFields),
  enumerable: true,
});

Object.defineProperty(SchemaElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Schema.fixedFields),
  enumerable: true,
});

Object.defineProperty(DiscriminatorElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Discriminator.fixedFields),
  enumerable: true,
});

Object.defineProperty(XmlElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.XML.fixedFields),
  enumerable: true,
});

Object.defineProperty(SecuritySchemeElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.SecurityScheme.fixedFields),
  enumerable: true,
});

Object.defineProperty(OAuthFlowsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.OAuthFlows.fixedFields),
  enumerable: true,
});

Object.defineProperty(OAuthFlowElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.OAuthFlow.fixedFields),
  enumerable: true,
});

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
  LicenseElement,
  LinkElement,
  MediaTypeElement,
  OAuthFlowElement,
  OAuthFlowsElement,
  OpenapiElement,
  OpenApi3_0Element,
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
};
