import {
  ArrayElement,
  ObjectElement,
  StringElement,
  isStringElement,
  isElement,
  isMemberElement,
  isArrayElement,
  includesClasses,
  cloneDeep,
  SourceMapElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path, getNodeType } from '@speclynx/apidom-traverse';

/**
 * OpenAPI 2.0 specification elements.
 */
import InfoElement from '../../elements/Info.ts';
import ContactElement from '../../elements/Contact.ts';
import LicenseElement from '../../elements/License.ts';
import PathsElement from '../../elements/Paths.ts';
import PathItemElement from '../../elements/PathItem.ts';
import OperationElement from '../../elements/Operation.ts';
import ExternalDocumentationElement from '../../elements/ExternalDocumentation.ts';
import ParameterElement from '../../elements/Parameter.ts';
import ItemsElement from '../../elements/Items.ts';
import ResponsesElement from '../../elements/Responses.ts';
import ResponseElement from '../../elements/Response.ts';
import HeadersElement from '../../elements/Headers.ts';
import ExampleElement from '../../elements/Example.ts';
import HeaderElement from '../../elements/Header.ts';
import TagElement from '../../elements/Tag.ts';
import SchemaElement from '../../elements/Schema.ts';
import XmlElement from '../../elements/Xml.ts';
import DefinitionsElement from '../../elements/Definitions.ts';
import ParametersDefinitionsElement from '../../elements/ParametersDefinitions.ts';
import ResponsesDefinitionsElement from '../../elements/ResponsesDefinitions.ts';
import SecurityDefinitionsElement from '../../elements/SecurityDefinitions.ts';
import SecuritySchemeElement from '../../elements/SecurityScheme.ts';
import ScopesElement from '../../elements/Scopes.ts';
import SecurityRequirementElement from '../../elements/SecurityRequirement.ts';
// non-concrete Elements (NCEs)
import OperationConsumesElement from '../../elements/nces/OperationConsumes.ts';
import OperationParametersElement from '../../elements/nces/OperationParameters.ts';
import OperationProducesElement from '../../elements/nces/OperationProduces.ts';
import OperationSchemesElement from '../../elements/nces/OperationSchemes.ts';
import OperationSecurityElement from '../../elements/nces/OperationSecurity.ts';
import OperationTagsElement from '../../elements/nces/OperationTags.ts';
import PathItemParametersElement from '../../elements/nces/PathItemParameters.ts';
import SwaggerSchemesElement from '../../elements/nces/SwaggerSchemes.ts';
import SwaggerConsumesElement from '../../elements/nces/SwaggerConsumes.ts';
import SwaggerProducesElement from '../../elements/nces/SwaggerProduces.ts';
import SwaggerSecurityElement from '../../elements/nces/SwaggerSecurity.ts';
import SwaggerTagsElement from '../../elements/nces/SwaggerTags.ts';

/**
 * This plugin is specific to YAML 1.2 format, which allows defining key-value pairs
 * with empty key, empty value, or both. If the value is not provided in YAML format,
 * this plugin compensates for this missing value with the most appropriate semantic element type.
 *
 * https://yaml.org/spec/1.2.2/#72-empty-nodes
 *
 * @example
 *
 * ```yaml
 * swagger: "2.0"
 * info:
 * ```
 * Refracting result without this plugin:
 *
 *  (SwaggerElement
 *    (MemberElement
 *      (StringElement)
 *      (SwaggerVersionElement))
 *    (MemberElement
 *      (StringElement)
 *      (StringElement))
 *
 * Refracting result with this plugin:
 *
 *  (SwaggerElement
 *    (MemberElement
 *      (StringElement)
 *      (SwaggerVersionElement))
 *    (MemberElement
 *      (StringElement)
 *      (InfoElement))
 */

const isEmptyElement = (element: unknown) =>
  isStringElement(element) && includesClasses(element, ['yaml-e-node', 'yaml-e-scalar']);

const schema = {
  // concrete types handling (CTs)
  SwaggerElement: {
    info(...args: any[]) {
      return new InfoElement(...args);
    },
    schemes(...args: any[]) {
      return new SwaggerSchemesElement(...args);
    },
    consumes(...args: any[]) {
      return new SwaggerConsumesElement(...args);
    },
    produces(...args: any[]) {
      return new SwaggerProducesElement(...args);
    },
    paths(...args: any[]) {
      return new PathsElement(...args);
    },
    definitions(...args: any[]) {
      return new DefinitionsElement(...args);
    },
    parameters(...args: any[]) {
      return new ParametersDefinitionsElement(...args);
    },
    responses(...args: any[]) {
      return new ResponsesDefinitionsElement(...args);
    },
    securityDefinitions(...args: any[]) {
      return new SecurityDefinitionsElement(...args);
    },
    security(...args: any[]) {
      return new SwaggerSecurityElement(...args);
    },
    tags(...args: any[]) {
      return new SwaggerTagsElement(...args);
    },
    externalDocs(...args: any[]) {
      return new ExternalDocumentationElement(...args);
    },
  },
  InfoElement: {
    contact(...args: any[]) {
      return new ContactElement(...args);
    },
    license(...args: any[]) {
      return new LicenseElement(...args);
    },
  },
  PathsElement: {
    '[key: *]': function key(...args: any[]) {
      return new PathItemElement(...args);
    },
  },
  PathItemElement: {
    get(...args: any[]) {
      return new OperationElement(...args);
    },
    put(...args: any[]) {
      return new OperationElement(...args);
    },
    post(...args: any[]) {
      return new OperationElement(...args);
    },
    delete(...args: any[]) {
      return new OperationElement(...args);
    },
    options(...args: any[]) {
      return new OperationElement(...args);
    },
    head(...args: any[]) {
      return new OperationElement(...args);
    },
    patch(...args: any[]) {
      return new OperationElement(...args);
    },
    parameters(...args: any[]) {
      return new PathItemParametersElement(...args);
    },
  },
  OperationElement: {
    tags(...args: any[]) {
      return new OperationTagsElement(...args);
    },
    externalDocs(...args: any[]) {
      return new ExternalDocumentationElement(...args);
    },
    consumes(...args: any[]) {
      return new OperationConsumesElement(...args);
    },
    produces(...args: any[]) {
      return new OperationProducesElement(...args);
    },
    parameters(...args: any[]) {
      return new OperationParametersElement(...args);
    },
    responses(...args: any[]) {
      return new ResponsesElement(...args);
    },
    schemes(...args: any[]) {
      return new OperationSchemesElement(...args);
    },
    security(...args: any[]) {
      return new OperationSecurityElement(...args);
    },
  },
  ParameterElement: {
    schema(...args: any[]) {
      return new SchemaElement(...args);
    },
    items(...args: any[]) {
      return new ItemsElement(...args);
    },
  },
  ItemsElement: {
    items(...args: any[]) {
      return new ItemsElement(...args);
    },
  },
  ResponsesElement: {
    '[key: *]': function key(...args: any[]) {
      return new ResponseElement(...args);
    },
  },
  ResponseElement: {
    schema(...args: any[]) {
      return new SchemaElement(...args);
    },
    headers(...args: any[]) {
      return new HeadersElement(...args);
    },
    examples(...args: any[]) {
      return new ExampleElement(...args);
    },
  },
  HeadersElement: {
    '[key: *]': function key(...args: any[]) {
      return new HeaderElement(...args);
    },
  },
  HeaderElement: {
    items(...args: any[]) {
      return new ItemsElement(...args);
    },
  },
  TagElement: {
    externalDocs(...args: any[]) {
      return new ExternalDocumentationElement(...args);
    },
  },
  SchemaElement: {
    items(...args: any[]) {
      return new SchemaElement(...args);
    },
    allOf(...args: any[]) {
      const element = new ArrayElement(...args);
      element.classes.push('json-schema-allOf');
      return element;
    },
    properties(...args: any[]) {
      const element = new ObjectElement(...args);
      element.classes.push('json-schema-properties');
      return element;
    },
    additionalProperties(...args: any[]) {
      return new SchemaElement(...args);
    },
    xml(...args: any[]) {
      return new XmlElement(...args);
    },
    externalDocs(...args: any[]) {
      return new ExternalDocumentationElement(...args);
    },
  },
  DefinitionsElement: {
    '[key: *]': function key(...args: any[]) {
      return new SchemaElement(...args);
    },
  },
  ParametersDefinitionsElement: {
    '[key: *]': function key(...args: any[]) {
      return new ParameterElement(...args);
    },
  },
  ResponsesDefinitionsElement: {
    '[key: *]': function key(...args: any[]) {
      return new ResponseElement(...args);
    },
  },
  SecurityDefinitionsElement: {
    '[key: *]': function key(...args: any[]) {
      return new SecuritySchemeElement(...args);
    },
  },
  SecuritySchemeElement: {
    scopes(...args: any[]) {
      return new ScopesElement(...args);
    },
  },
  SecurityRequirementElement: {
    '[key: *]': function key(...args: any[]) {
      return new ArrayElement(...args);
    },
  },
  // non-concrete types handling (NCEs)
  [OperationParametersElement.primaryClass]: {
    '<*>': function asterisk(...args: any[]) {
      return new ParameterElement(...args);
    },
  },
  [OperationSecurityElement.primaryClass]: {
    '<*>': function asterisk(...args: any[]) {
      return new SecurityRequirementElement(...args);
    },
  },
  [PathItemParametersElement.primaryClass]: {
    '<*>': function asterisk(...args: any[]) {
      return new ParameterElement(...args);
    },
  },
  [SwaggerSecurityElement.primaryClass]: {
    '<*>': function asterisk(...args: any[]) {
      return new SecurityRequirementElement(...args);
    },
  },
  [SwaggerTagsElement.primaryClass]: {
    '<*>': function asterisk(...args: any[]) {
      return new TagElement(...args);
    },
  },
  'json-schema-properties': {
    '[key: *]': function key(...args: any[]) {
      return new SchemaElement(...args);
    },
  },
  'json-schema-allOf': {
    '<*>': function asterisk(...args: any[]) {
      return new SchemaElement(...args);
    },
  },
};

const findElementFactory = (ancestor: any, keyName: string) => {
  const elementType = getNodeType(ancestor); // @ts-ignore
  const keyMapping = schema[elementType] || schema[toValue(ancestor.classes.first)];

  return typeof keyMapping === 'undefined'
    ? undefined
    : Object.hasOwn(keyMapping, '[key: *]')
      ? keyMapping['[key: *]']
      : (keyMapping as Record<string, unknown>)[keyName];
};

/**
 * @public
 */
const plugin = () => () => ({
  visitor: {
    StringElement(path: Path<StringElement>) {
      const element = path.node;

      if (!isEmptyElement(element)) return;

      // getAncestorNodes() returns [parent, grandparent, ..., root], so reverse to get [root, ..., parent]
      const lineage = path.getAncestorNodes().reverse().filter(isElement);
      const parentElement = lineage.at(-1);
      let elementFactory;
      let context;

      if (isArrayElement(parentElement)) {
        context = element;
        elementFactory = findElementFactory(parentElement, '<*>');
      } else if (isMemberElement(parentElement)) {
        context = lineage.at(-2);
        elementFactory = findElementFactory(context, toValue(parentElement.key) as string);
      }

      // no element factory found
      if (typeof elementFactory !== 'function') return;

      const replacement = elementFactory.call(
        { context },
        undefined,
        cloneDeep(element.meta),
        cloneDeep(element.attributes),
      );

      SourceMapElement.transfer(element, replacement);
      path.replaceWith(replacement);
    },
  },
});

export default plugin;
