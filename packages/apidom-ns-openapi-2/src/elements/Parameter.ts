import {
  StringElement,
  BooleanElement,
  type Attributes,
  type Meta,
  NumberElement,
  ArrayElement,
  ObjectElement,
} from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';
import {
  JSONReferenceElement,
  JSONSchemaElement,
  MediaElement,
  LinkDescriptionElement,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import SchemaElement from './Schema.ts';

/**
 * @public
 */
class Parameter extends JSONSchemaElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'parameter';
    this.classes.push('json-schema-draft-4');
  }

  /**
   * Core vocabulary
   *
   * URI: https://tools.ietf.org/html/draft-wright-json-schema-00
   */

  get idField(): StringElement | undefined {
    throw new UnsupportedOperationError('idField getter in Parameter class is not not supported.');
  }

  set idField(idField: StringElement | undefined) {
    throw new UnsupportedOperationError('idField setter in Parameter class is not not supported.');
  }

  get $schema(): StringElement | undefined {
    throw new UnsupportedOperationError('$schema getter in Parameter class is not not supported.');
  }

  set $schema($schema: StringElement | undefined) {
    throw new UnsupportedOperationError('$schema setter in Parameter class is not not supported.');
  }

  /**
   * Validation keywords for arrays
   */

  get additionalItems(): this | JSONReferenceElement | BooleanElement | undefined {
    throw new UnsupportedOperationError(
      'additionalItems getter in Parameter class is not not supported.',
    );
  }

  set additionalItems(additionalItems: this | JSONReferenceElement | BooleanElement | undefined) {
    throw new UnsupportedOperationError(
      'additionalItems setter in Parameter class is not not supported.',
    );
  }

  get itemsField(): this | undefined {
    return this.get('items') as this | undefined;
  }

  set itemsField(items: this | undefined) {
    this.set('items', items);
  }

  /**
   * Validation keywords for objects
   */

  get maxProperties(): NumberElement | undefined {
    throw new UnsupportedOperationError(
      'maxProperties getter in Parameter class is not not supported.',
    );
  }

  set maxProperties(maxProperties: NumberElement | undefined) {
    throw new UnsupportedOperationError(
      'maxProperties setter in Parameter class is not not supported.',
    );
  }

  get minProperties(): NumberElement | undefined {
    throw new UnsupportedOperationError(
      'minProperties getter in Parameter class is not not supported.',
    );
  }

  set minProperties(minProperties: NumberElement | undefined) {
    throw new UnsupportedOperationError(
      'minProperties setter in Parameter class is not not supported.',
    );
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  get required(): BooleanElement | undefined | any {
    return this.get('required') as BooleanElement | undefined | any;
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  set required(required: BooleanElement | undefined | any) {
    this.set('required', required);
  }

  get properties(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'properties getter in Parameter class is not not supported.',
    );
  }

  set properties(properties: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'properties setter in Parameter class is not not supported.',
    );
  }

  get additionalProperties(): this | JSONReferenceElement | BooleanElement | undefined {
    throw new UnsupportedOperationError(
      'additionalProperties getter in Parameter class is not not supported.',
    );
  }

  set additionalProperties(
    additionalProperties: this | JSONReferenceElement | BooleanElement | undefined,
  ) {
    throw new UnsupportedOperationError(
      'additionalProperties setter in Parameter class is not not supported.',
    );
  }

  get patternProperties(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'patternProperties getter in Parameter class is not not supported.',
    );
  }

  set patternProperties(patternProperties: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'patternProperties setter in Parameter class is not not supported.',
    );
  }

  get dependencies(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'dependencies getter in Parameter class is not not supported.',
    );
  }

  set dependencies(dependencies: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'dependencies setter in Parameter class is not not supported.',
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

  get allOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    throw new UnsupportedOperationError('allOf getter in Parameter class is not not supported.');
  }

  set allOf(allOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    throw new UnsupportedOperationError('allOf setter in Parameter class is not not supported.');
  }

  get anyOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    throw new UnsupportedOperationError('anyOf getter in Parameter class is not not supported.');
  }

  set anyOf(anyOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    throw new UnsupportedOperationError('anyOf setter in Parameter class is not not supported.');
  }

  get oneOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    throw new UnsupportedOperationError('oneOf getter in Parameter class is not not supported.');
  }

  set oneOf(oneOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    throw new UnsupportedOperationError('oneOf setter in Parameter class is not not supported.');
  }

  get not(): this | JSONReferenceElement | undefined {
    throw new UnsupportedOperationError('not getter in Parameter class is not not supported.');
  }

  set not(not: this | JSONReferenceElement | undefined) {
    throw new UnsupportedOperationError('not setter in Parameter class is not not supported.');
  }

  get definitions(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'definitions getter in Parameter class is not not supported.',
    );
  }

  set definitions(definitions: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'definitions setter in Parameter class is not not supported.',
    );
  }

  /**
   * Metadata keywords
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-6
   */

  get title(): StringElement | undefined {
    throw new UnsupportedOperationError('title getter in Parameter class is not not supported.');
  }

  set title(title: StringElement | undefined) {
    throw new UnsupportedOperationError('title setter in Parameter class is not not supported.');
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  /**
   * Semantic validation with "format"
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-7
   */

  get format(): StringElement | undefined {
    return this.get('format') as StringElement | undefined;
  }

  set format(format: StringElement | undefined) {
    this.set('format', format);
  }

  /**
   * JSON Hyper-Schema
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-hyperschema-00
   */

  get base(): StringElement | undefined {
    throw new UnsupportedOperationError('base getter in Parameter class is not not supported.');
  }

  set base(base: StringElement | undefined) {
    throw new UnsupportedOperationError('base setter in Parameter class is not not supported.');
  }

  get linksField(): ArrayElement<LinkDescriptionElement> | undefined {
    throw new UnsupportedOperationError(
      'linksField getter in Parameter class is not not supported.',
    );
  }

  set linksField(links: ArrayElement<LinkDescriptionElement> | undefined) {
    throw new UnsupportedOperationError(
      'linksField setter in Parameter class is not not supported.',
    );
  }

  get media(): MediaElement | undefined {
    throw new UnsupportedOperationError('media getter in Parameter class is not not supported.');
  }

  set media(media: MediaElement | undefined) {
    throw new UnsupportedOperationError('media setter in Parameter class is not not supported.');
  }

  get readOnly(): BooleanElement | undefined {
    throw new UnsupportedOperationError('readOnly getter in Parameter class is not not supported.');
  }

  set readOnly(readOnly: BooleanElement | undefined) {
    throw new UnsupportedOperationError('readOnly setter in Parameter class is not not supported.');
  }

  /**
   * OpenAPI vocabulary
   */
  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get in(): StringElement | undefined {
    return this.get('in') as StringElement | undefined;
  }

  set in(val: StringElement | undefined) {
    this.set('in', val);
  }

  get schema(): SchemaElement | undefined {
    return this.get('schema') as SchemaElement | undefined;
  }

  set schema(schema: SchemaElement | undefined) {
    this.set('schema', schema);
  }
}

export default Parameter;
