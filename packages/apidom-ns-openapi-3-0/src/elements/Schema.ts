import { UnsupportedOperationError } from '@speclynx/apidom-error';
import {
  StringElement,
  BooleanElement,
  Element,
  ObjectElement,
  ArrayElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';
import {
  JSONSchemaElement,
  MediaElement,
  LinkDescriptionElement,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import ReferenceElement from './Reference.ts';
import DiscriminatorElement from './Discriminator.ts';
import XmlElement from './Xml.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';

/**
 * @public
 */
class Schema extends JSONSchemaElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'schema';
    this.classes.push('json-schema-draft-4');
  }

  /**
   * Core vocabulary
   *
   * URI: https://tools.ietf.org/html/draft-wright-json-schema-00
   */
  get idField(): StringElement | undefined {
    throw new UnsupportedOperationError('idField getter in Schema class is not not supported.');
  }

  set idField(idField: StringElement | undefined) {
    throw new UnsupportedOperationError('idField setter in Schema class is not not supported.');
  }

  get $schema(): StringElement | undefined {
    throw new UnsupportedOperationError('$schema getter in Schema class is not not supported.');
  }

  set $schema($schema: StringElement | undefined) {
    throw new UnsupportedOperationError('$schema setter in Schema class is not not supported.');
  }

  /**
   * Validation keywords for arrays
   */

  get additionalItems(): this | ReferenceElement | BooleanElement | undefined {
    return this.get('additionalItems') as this | ReferenceElement | BooleanElement | undefined;
  }

  set additionalItems(additionalItems: this | ReferenceElement | BooleanElement | undefined) {
    this.set('additionalItems', additionalItems);
  }

  override get itemsField(): this | ReferenceElement | undefined {
    return this.get('items') as this | ReferenceElement | undefined;
  }

  override set itemsField(items: this | ReferenceElement | undefined) {
    this.set('items', items);
  }

  /**
   * Validation keywords for objects
   */

  get additionalProperties(): this | ReferenceElement | BooleanElement | undefined {
    return this.get('additionalProperties') as this | ReferenceElement | BooleanElement | undefined;
  }

  set additionalProperties(
    additionalProperties: this | ReferenceElement | BooleanElement | undefined,
  ) {
    this.set('additionalProperties', additionalProperties);
  }

  get patternProperties(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'patternProperties getter in Schema class is not not supported.',
    );
  }

  set patternProperties(patternProperties: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'patternProperties setter in Schema class is not not supported.',
    );
  }

  get dependencies(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'dependencies getter in Schema class is not not supported.',
    );
  }

  set dependencies(dependencies: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'dependencies setter in Schema class is not not supported.',
    );
  }

  /**
   *  Validation keywords for any instance type
   */

  get type(): StringElement | undefined {
    return this.get('type') as StringElement | undefined;
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get not(): this | ReferenceElement | undefined {
    return this.get('not') as this | ReferenceElement | undefined;
  }

  set not(not: this | ReferenceElement | undefined) {
    this.set('not', not);
  }

  get definitions(): ObjectElement | undefined {
    throw new UnsupportedOperationError('definitions getter in Schema class is not not supported.');
  }

  set definitions(definitions: ObjectElement | undefined) {
    throw new UnsupportedOperationError('definitions setter in Schema class is not not supported.');
  }

  /**
   * JSON Hyper-Schema
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-hyperschema-00
   */

  get base(): StringElement | undefined {
    throw new UnsupportedOperationError('base getter in Schema class is not not supported.');
  }

  set base(base: StringElement | undefined) {
    throw new UnsupportedOperationError('base setter in Schema class is not not supported.');
  }

  override get linksField(): ArrayElement<LinkDescriptionElement> | undefined {
    throw new UnsupportedOperationError('linksField getter in Schema class is not not supported.');
  }

  override set linksField(links: ArrayElement<LinkDescriptionElement> | undefined) {
    throw new UnsupportedOperationError('linksField setter in Schema class is not not supported.');
  }

  get media(): MediaElement | undefined {
    throw new UnsupportedOperationError('media getter in Schema class is not not supported.');
  }

  set media(media: MediaElement | undefined) {
    throw new UnsupportedOperationError('media setter in Schema class is not not supported.');
  }

  /**
   * OpenAPI vocabulary
   */

  get nullable(): BooleanElement | undefined {
    return this.get('nullable') as BooleanElement | undefined;
  }

  set nullable(nullable: BooleanElement | undefined) {
    this.set('nullable', nullable);
  }

  get discriminator(): DiscriminatorElement | undefined {
    return this.get('discriminator') as DiscriminatorElement | undefined;
  }

  set discriminator(discriminator: DiscriminatorElement | undefined) {
    this.set('discriminator', discriminator);
  }

  get writeOnly(): BooleanElement | undefined {
    return this.get('writeOnly') as BooleanElement | undefined;
  }

  set writeOnly(writeOnly: BooleanElement | undefined) {
    this.set('writeOnly', writeOnly);
  }

  get xml(): XmlElement | undefined {
    return this.get('xml') as XmlElement | undefined;
  }

  set xml(xml: XmlElement | undefined) {
    this.set('xml', xml);
  }

  get externalDocs(): ExternalDocumentationElement | undefined {
    return this.get('externalDocs') as ExternalDocumentationElement | undefined;
  }

  set externalDocs(externalDocs: ExternalDocumentationElement | undefined) {
    this.set('externalDocs', externalDocs);
  }

  get example(): Element | undefined {
    return this.get('example') as Element | undefined;
  }

  set example(example: Element | undefined) {
    this.set('example', example);
  }

  get deprecated(): BooleanElement | undefined {
    return this.get('deprecated') as BooleanElement | undefined;
  }

  set deprecated(deprecated: BooleanElement | undefined) {
    this.set('deprecated', deprecated);
  }
}

export default Schema;
