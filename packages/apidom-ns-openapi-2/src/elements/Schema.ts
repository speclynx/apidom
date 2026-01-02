import {
  type Attributes,
  type Meta,
  ArrayElement,
  BooleanElement,
  ObjectElement,
  StringElement,
} from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';
import {
  JSONReferenceElement,
  JSONSchemaElement,
  MediaElement,
  LinkDescriptionElement,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import type XmlElement from './Xml.ts';

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

  get additionalItems(): this | JSONReferenceElement | BooleanElement | undefined {
    throw new UnsupportedOperationError(
      'additionalItems getter in Schema class is not not supported.',
    );
  }

  set additionalItems(additionalItems: this | JSONReferenceElement | BooleanElement | undefined) {
    throw new UnsupportedOperationError(
      'additionalItems setter in Schema class is not not supported.',
    );
  }

  /**
   * Validation keywords for objects
   */

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
  get anyOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    throw new UnsupportedOperationError('anyOf getter in Schema class is not not supported.');
  }

  set anyOf(anyOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    throw new UnsupportedOperationError('anyOf setter in Schema class is not not supported.');
  }

  get oneOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    throw new UnsupportedOperationError('oneOf getter in Schema class is not not supported.');
  }

  set oneOf(oneOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    throw new UnsupportedOperationError('oneOf setter in Schema class is not not supported.');
  }

  get not(): this | JSONReferenceElement | undefined {
    throw new UnsupportedOperationError('not getter in Schema class is not not supported.');
  }

  set not(not: this | JSONReferenceElement | undefined) {
    throw new UnsupportedOperationError('not setter in Schema class is not not supported.');
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

  get linksField(): ArrayElement<LinkDescriptionElement> | undefined {
    throw new UnsupportedOperationError('linksField getter in Schema class is not not supported.');
  }

  set linksField(links: ArrayElement<LinkDescriptionElement> | undefined) {
    throw new UnsupportedOperationError('linksField setter in Schema class is not not supported.');
  }

  get media(): MediaElement | undefined {
    throw new UnsupportedOperationError('media getter in Schema class is not not supported.');
  }

  set media(media: MediaElement | undefined) {
    throw new UnsupportedOperationError('media setter in Schema class is not not supported.');
  }

  /**
   * OpenAPI 2.0 specific
   */

  get xml(): XmlElement | undefined {
    return this.get('xml') as XmlElement | undefined;
  }

  set xml(xml: XmlElement | undefined) {
    this.set('xml', xml);
  }

  get discriminator(): StringElement | undefined {
    return this.get('discriminator') as StringElement | undefined;
  }

  set discriminator(discriminator: StringElement | undefined) {
    this.set('discriminator', discriminator);
  }

  get readOnly(): BooleanElement | undefined {
    return this.get('readOnly') as BooleanElement | undefined;
  }

  set readOnly(readOnly: BooleanElement | undefined) {
    this.set('readOnly', readOnly);
  }

  get externalDocs(): ObjectElement | undefined {
    return this.get('externalDocs') as ObjectElement | undefined;
  }

  set externalDocs(externalDocs: ObjectElement | undefined) {
    this.set('externalDocs', externalDocs);
  }

  get example(): unknown {
    return this.get('example');
  }

  set example(example: unknown) {
    this.set('example', example);
  }
}

export default Schema;
