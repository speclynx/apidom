import {
  Element,
  ArrayElement,
  NumberElement,
  ObjectElement,
  StringElement,
  BooleanElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';

import JSONReferenceElement from './JSONReference.ts';
import MediaElement from './Media.ts';
import LinkDescriptionElement from './LinkDescription.ts';
import type { FixedField } from '../refractor/inspect.ts';

/**
 * @public
 */
class JSONSchema extends ObjectElement {
  declare static fixedFields: FixedField[];

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'JSONSchemaDraft4';
  }

  /**
   * Core vocabulary
   *
   * URI: https://tools.ietf.org/html/draft-wright-json-schema-00
   */

  get idField(): StringElement | undefined {
    return this.get('id') as StringElement | undefined;
  }

  set idField(idField: StringElement | undefined) {
    this.set('id', idField);
  }

  get $schema(): StringElement | undefined {
    return this.get('$schema') as StringElement | undefined;
  }

  set $schema($schema: StringElement | undefined) {
    this.set('$schema', $schema);
  }

  /**
   * Validation vocabulary
   *
   * URI: https://tools.ietf.org/html/draft-wright-json-schema-validation-00
   */

  /**
   *  Validation keywords for numeric instances (number and integer)
   */

  get multipleOf(): NumberElement | undefined {
    return this.get('multipleOf') as NumberElement | undefined;
  }

  set multipleOf(multipleOf: NumberElement | undefined) {
    this.set('multipleOf', multipleOf);
  }

  get maximum(): NumberElement | undefined {
    return this.get('maximum') as NumberElement | undefined;
  }

  set maximum(maximum: NumberElement | undefined) {
    this.set('maximum', maximum);
  }

  get exclusiveMaximum(): BooleanElement | undefined {
    return this.get('exclusiveMaximum') as BooleanElement | undefined;
  }

  set exclusiveMaximum(exclusiveMaximum: BooleanElement | undefined) {
    this.set('exclusiveMaximum', exclusiveMaximum);
  }

  get minimum(): NumberElement | undefined {
    return this.get('minimum') as NumberElement | undefined;
  }

  set minimum(minimum: NumberElement | undefined) {
    this.set('minimum', minimum);
  }

  get exclusiveMinimum(): BooleanElement | undefined {
    return this.get('exclusiveMinimum') as BooleanElement | undefined;
  }

  set exclusiveMinimum(exclusiveMinimum: BooleanElement | undefined) {
    this.set('exclusiveMinimum', exclusiveMinimum);
  }

  /**
   * Validation keywords for strings
   */

  get maxLength(): NumberElement | undefined {
    return this.get('maxLength') as NumberElement | undefined;
  }

  set maxLength(maxLength: NumberElement | undefined) {
    this.set('maxLength', maxLength);
  }

  get minLength(): NumberElement | undefined {
    return this.get('minLength') as NumberElement | undefined;
  }

  set minLength(minLength: NumberElement | undefined) {
    this.set('minLength', minLength);
  }

  get pattern(): StringElement | undefined {
    return this.get('pattern') as StringElement | undefined;
  }

  set pattern(pattern: StringElement | undefined) {
    this.set('pattern', pattern);
  }

  /**
   * Validation keywords for arrays
   */

  get additionalItems(): this | JSONReferenceElement | BooleanElement | undefined {
    return this.get('additionalItems') as this | JSONReferenceElement | BooleanElement | undefined;
  }

  set additionalItems(additionalItems: this | JSONReferenceElement | BooleanElement | undefined) {
    this.set('additionalItems', additionalItems);
  }

  get itemsField():
    | this
    | JSONReferenceElement
    | ArrayElement<this | JSONReferenceElement>
    | undefined {
    return this.get('items') as
      | this
      | JSONReferenceElement
      | ArrayElement<this | JSONReferenceElement>
      | undefined;
  }

  set itemsField(
    items: this | JSONReferenceElement | ArrayElement<this | JSONReferenceElement> | undefined,
  ) {
    this.set('items', items);
  }

  get maxItems(): NumberElement | undefined {
    return this.get('maxItems') as NumberElement | undefined;
  }

  set maxItems(maxItems: NumberElement | undefined) {
    this.set('maxItems', maxItems);
  }

  get minItems(): NumberElement | undefined {
    return this.get('minItems') as NumberElement | undefined;
  }

  set minItems(minItems: NumberElement | undefined) {
    this.set('minItems', minItems);
  }

  get uniqueItems(): BooleanElement | undefined {
    return this.get('uniqueItems') as BooleanElement | undefined;
  }

  set uniqueItems(uniqueItems: BooleanElement | undefined) {
    this.set('uniqueItems', uniqueItems);
  }

  /**
   * Validation keywords for objects
   */

  get maxProperties(): NumberElement | undefined {
    return this.get('maxProperties') as NumberElement | undefined;
  }

  set maxProperties(maxProperties: NumberElement | undefined) {
    this.set('maxProperties', maxProperties);
  }

  get minProperties(): NumberElement | undefined {
    return this.get('minProperties') as NumberElement | undefined;
  }

  set minProperties(minProperties: NumberElement | undefined) {
    this.set('minProperties', minProperties);
  }

  get required(): ArrayElement<StringElement> | undefined {
    return this.get('required') as ArrayElement<StringElement> | undefined;
  }

  set required(required: ArrayElement<StringElement> | undefined) {
    this.set('required', required);
  }

  get properties(): ObjectElement | undefined {
    return this.get('properties') as ObjectElement | undefined;
  }

  set properties(properties: ObjectElement | undefined) {
    this.set('properties', properties);
  }

  get additionalProperties(): this | JSONReferenceElement | BooleanElement | undefined {
    return this.get('additionalProperties') as
      | this
      | JSONReferenceElement
      | BooleanElement
      | undefined;
  }

  set additionalProperties(
    additionalProperties: this | JSONReferenceElement | BooleanElement | undefined,
  ) {
    this.set('additionalProperties', additionalProperties);
  }

  get patternProperties(): ObjectElement | undefined {
    return this.get('patternProperties') as ObjectElement | undefined;
  }

  set patternProperties(patternProperties: ObjectElement | undefined) {
    this.set('patternProperties', patternProperties);
  }

  get dependencies(): ObjectElement | undefined {
    return this.get('dependencies') as ObjectElement | undefined;
  }

  set dependencies(dependencies: ObjectElement | undefined) {
    this.set('dependencies', dependencies);
  }

  /**
   *  Validation keywords for any instance type
   */

  get enum(): ArrayElement<Element> | undefined {
    return this.get('enum') as ArrayElement<Element> | undefined;
  }

  set enum(enumValue: ArrayElement<Element> | undefined) {
    this.set('enum', enumValue);
  }

  get type(): ArrayElement<StringElement> | StringElement | undefined {
    return this.get('type') as ArrayElement<StringElement> | StringElement | undefined;
  }

  set type(type: ArrayElement<StringElement> | StringElement | undefined) {
    this.set('type', type);
  }

  get allOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    return this.get('allOf') as ArrayElement<this | JSONReferenceElement> | undefined;
  }

  set allOf(allOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    this.set('allOf', allOf);
  }

  get anyOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    return this.get('anyOf') as ArrayElement<this | JSONReferenceElement> | undefined;
  }

  set anyOf(anyOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    this.set('anyOf', anyOf);
  }

  get oneOf(): ArrayElement<this | JSONReferenceElement> | undefined {
    return this.get('oneOf') as ArrayElement<this | JSONReferenceElement> | undefined;
  }

  set oneOf(oneOf: ArrayElement<this | JSONReferenceElement> | undefined) {
    this.set('oneOf', oneOf);
  }

  get not(): this | JSONReferenceElement | undefined {
    return this.get('not') as this | JSONReferenceElement | undefined;
  }

  set not(not: this | JSONReferenceElement | undefined) {
    this.set('not', not);
  }

  get definitions(): ObjectElement | undefined {
    return this.get('definitions') as ObjectElement | undefined;
  }

  set definitions(definitions: ObjectElement | undefined) {
    this.set('definitions', definitions);
  }

  /**
   * Metadata keywords
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-6
   */

  get title(): StringElement | undefined {
    return this.get('title') as StringElement | undefined;
  }

  set title(title: StringElement | undefined) {
    this.set('title', title);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get default(): Element | undefined {
    return this.get('default') as Element | undefined;
  }

  set default(defaultValue: Element | undefined) {
    this.set('default', defaultValue);
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
    return this.get('base') as StringElement | undefined;
  }

  set base(base: StringElement | undefined) {
    this.set('base', base);
  }

  get linksField(): ArrayElement<LinkDescriptionElement> | undefined {
    return this.get('links') as ArrayElement<LinkDescriptionElement> | undefined;
  }

  set linksField(links: ArrayElement<LinkDescriptionElement> | undefined) {
    this.set('links', links);
  }

  get media(): MediaElement | undefined {
    return this.get('media') as MediaElement | undefined;
  }

  set media(media: MediaElement | undefined) {
    this.set('media', media);
  }

  get readOnly(): BooleanElement | undefined {
    return this.get('readOnly') as BooleanElement | undefined;
  }

  set readOnly(readOnly: BooleanElement | undefined) {
    this.set('readOnly', readOnly);
  }
}

export default JSONSchema;
