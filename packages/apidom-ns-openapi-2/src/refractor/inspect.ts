import { resolveSpecification, type ResolvedSpecification } from '@speclynx/apidom-core';
import { isPlainObject } from 'ramda-adjunct';

/**
 * OpenAPI 2.0 specification elements.
 */
import SwaggerElement from '../elements/Swagger.ts';
import SwaggerVersionElement from '../elements/SwaggerVersion.ts';
import InfoElement from '../elements/Info.ts';
import ContactElement from '../elements/Contact.ts';
import LicenseElement from '../elements/License.ts';
import PathsElement from '../elements/Paths.ts';
import PathItemElement from '../elements/PathItem.ts';
import OperationElement from '../elements/Operation.ts';
import ExternalDocumentationElement from '../elements/ExternalDocumentation.ts';
import ParameterElement from '../elements/Parameter.ts';
import ItemsElement from '../elements/Items.ts';
import ResponsesElement from '../elements/Responses.ts';
import ResponseElement from '../elements/Response.ts';
import HeadersElement from '../elements/Headers.ts';
import ExampleElement from '../elements/Example.ts';
import HeaderElement from '../elements/Header.ts';
import TagElement from '../elements/Tag.ts';
import ReferenceElement from '../elements/Reference.ts';
import SchemaElement from '../elements/Schema.ts';
import XmlElement from '../elements/Xml.ts';
import DefinitionsElement from '../elements/Definitions.ts';
import ParametersDefinitionsElement from '../elements/ParametersDefinitions.ts';
import ResponsesDefinitionsElement from '../elements/ResponsesDefinitions.ts';
import SecurityDefinitionsElement from '../elements/SecurityDefinitions.ts';
import SecuritySchemeElement from '../elements/SecurityScheme.ts';
import ScopesElement from '../elements/Scopes.ts';
import SecurityRequirementElement from '../elements/SecurityRequirement.ts';
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

// OpenAPI 2.0 specification elements
Object.defineProperty(SwaggerElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Swagger.fixedFields),
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

Object.defineProperty(ItemsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Items.fixedFields),
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

Object.defineProperty(XmlElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.XML.fixedFields),
  enumerable: true,
});

Object.defineProperty(SecuritySchemeElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.SecurityScheme.fixedFields),
  enumerable: true,
});

export {
  SwaggerElement,
  SwaggerVersionElement,
  InfoElement,
  ContactElement,
  LicenseElement,
  PathsElement,
  PathItemElement,
  OperationElement,
  ExternalDocumentationElement,
  ParameterElement,
  ItemsElement,
  ResponsesElement,
  ResponseElement,
  HeadersElement,
  ExampleElement,
  HeaderElement,
  TagElement,
  ReferenceElement,
  SchemaElement,
  XmlElement,
  DefinitionsElement,
  ParametersDefinitionsElement,
  ResponsesDefinitionsElement,
  SecurityDefinitionsElement,
  SecuritySchemeElement,
  ScopesElement,
  SecurityRequirementElement,
};
