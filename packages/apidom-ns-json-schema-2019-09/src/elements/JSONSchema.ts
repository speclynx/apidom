import {
  StringElement,
  ObjectElement,
  NumberElement,
  ArrayElement,
  BooleanElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';
import { JSONSchemaElement, JSONReferenceElement } from '@speclynx/apidom-ns-json-schema-draft-7';

import type { FixedField } from '../refractor/inspect.ts';

/**
 * @public
 */
class JSONSchema extends JSONSchemaElement {
  declare static fixedFields: FixedField[];

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'JSONSchema201909';
  }

  /**
   * Core vocabulary
   *
   * URI: https://json-schema.org/draft/2019-09/vocab/core
   */

  get $vocabulary(): ObjectElement | undefined {
    return this.get('$vocabulary') as ObjectElement | undefined;
  }

  set $vocabulary($vocabulary: ObjectElement | undefined) {
    this.set('$vocabulary', $vocabulary);
  }

  get $anchor(): StringElement | undefined {
    return this.get('$anchor') as StringElement | undefined;
  }

  set $anchor($anchor: StringElement | undefined) {
    this.set('$anchor', $anchor);
  }

  get $recursiveAnchor(): BooleanElement | undefined {
    return this.get('$recursiveAnchor') as BooleanElement | undefined;
  }

  set $recursiveAnchor($recursiveAnchor: BooleanElement | undefined) {
    this.set('$recursiveAnchor', $recursiveAnchor);
  }

  get $recursiveRef(): StringElement | undefined {
    return this.get('$recursiveRef') as StringElement | undefined;
  }

  set $recursiveRef($recursiveRef: StringElement | undefined) {
    this.set('$recursiveRef', $recursiveRef);
  }

  get $ref(): StringElement | undefined {
    return this.get('$ref') as StringElement | undefined;
  }

  set $ref($ref: StringElement | undefined) {
    this.set('$ref', $ref);
  }

  get $defs(): ObjectElement | undefined {
    return this.get('$defs') as ObjectElement | undefined;
  }

  set $defs($defs: ObjectElement | undefined) {
    this.set('$defs', $defs);
  }

  override get definitions(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'definitions keyword from Validation vocabulary has been renamed to $defs.',
    );
  }

  override set definitions(_definitions: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'definitions keyword from Validation vocabulary has been renamed to $defs.',
    );
  }

  /**
   * Applicator vocabulary
   *
   * URI: https://json-schema.org/draft/2019-09/vocab/applicator
   */

  override get not(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('not') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  override set not(not: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('not', not);
  }

  override get if(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('if') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  override set if(ifSchema: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('if', ifSchema);
  }

  override get then(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('then') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  override set then(thenSchema: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('then', thenSchema);
  }

  override get else(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('else') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  override set else(elseSchema: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('else', elseSchema);
  }

  get dependentSchemas(): ObjectElement | undefined {
    return this.get('dependentSchemas') as ObjectElement | undefined;
  }

  set dependentSchemas(dependentSchemas: ObjectElement | undefined) {
    this.set('dependentSchemas', dependentSchemas);
  }

  override get dependencies(): ObjectElement | undefined {
    throw new UnsupportedOperationError(
      'dependencies keyword from Validation vocabulary has been renamed to dependentSchemas.',
    );
  }

  override set dependencies(_dependencies: ObjectElement | undefined) {
    throw new UnsupportedOperationError(
      'dependencies keyword from Validation vocabulary has been renamed to dependentSchemas.',
    );
  }

  override get itemsField():
    | this
    | BooleanElement
    | JSONReferenceElement
    | ArrayElement<this | BooleanElement | JSONReferenceElement>
    | undefined {
    return this.get('items') as
      | this
      | BooleanElement
      | JSONReferenceElement
      | ArrayElement<this | BooleanElement | JSONReferenceElement>
      | undefined;
  }

  override set itemsField(
    items:
      | this
      | BooleanElement
      | JSONReferenceElement
      | ArrayElement<this | BooleanElement | JSONReferenceElement>
      | undefined,
  ) {
    this.set('items', items);
  }

  get contains(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('contains') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set contains(contains: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('contains', contains);
  }

  override get additionalProperties(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('additionalProperties') as
      | this
      | BooleanElement
      | JSONReferenceElement
      | undefined;
  }

  override set additionalProperties(
    additionalProperties: this | BooleanElement | JSONReferenceElement | undefined,
  ) {
    this.set('additionalProperties', additionalProperties);
  }

  override get additionalItems(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('additionalItems') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  override set additionalItems(
    additionalItems: this | BooleanElement | JSONReferenceElement | undefined,
  ) {
    this.set('additionalItems', additionalItems);
  }

  override get propertyNames(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('propertyNames') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  override set propertyNames(
    propertyNames: this | BooleanElement | JSONReferenceElement | undefined,
  ) {
    this.set('propertyNames', propertyNames);
  }

  get unevaluatedItems(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('unevaluatedItems') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set unevaluatedItems(unevaluatedItems: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('unevaluatedItems', unevaluatedItems);
  }

  get unevaluatedProperties(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('unevaluatedProperties') as
      | this
      | BooleanElement
      | JSONReferenceElement
      | undefined;
  }

  set unevaluatedProperties(
    unevaluatedProperties: this | BooleanElement | JSONReferenceElement | undefined,
  ) {
    this.set('unevaluatedProperties', unevaluatedProperties);
  }

  /**
   * Validation vocabulary
   *
   * URI: https://json-schema.org/draft/2019-09/json-schema-validation#rfc.section.6
   */

  /**
   * Validation Keywords for Arrays
   *
   * URI: https://json-schema.org/draft/2019-09/draft-handrews-json-schema-validation-02#rfc.section.6.4
   */

  get maxContains(): NumberElement | undefined {
    return this.get('maxContains') as NumberElement | undefined;
  }

  set maxContains(maxContains: NumberElement | undefined) {
    this.set('maxContains', maxContains);
  }

  get minContains(): NumberElement | undefined {
    return this.get('minContains') as NumberElement | undefined;
  }

  set minContains(minContains: NumberElement | undefined) {
    this.set('minContains', minContains);
  }

  /**
   * Validation Keywords for Objects
   *
   * URI: https://json-schema.org/draft/2019-09/draft-handrews-json-schema-validation-02#rfc.section.6.5
   */

  get dependentRequired(): ObjectElement | undefined {
    return this.get('dependentRequired') as ObjectElement | undefined;
  }

  set dependentRequired(dependentRequired: ObjectElement | undefined) {
    this.set('dependentRequired', dependentRequired);
  }

  /**
   * Vocabulary for Basic Meta-Data Annotations
   *
   * URI: https://json-schema.org/draft/2019-09/vocab/meta-data
   */

  get deprecated(): BooleanElement | undefined {
    return this.get('deprecated') as BooleanElement | undefined;
  }

  set deprecated(deprecated: BooleanElement | undefined) {
    this.set('deprecated', deprecated);
  }

  /**
   * Vocabulary for the Contents of String-Encoded Data
   *
   * URI: https://json-schema.org/draft/2019-09/vocab/content
   */

  get contentSchema(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('contentSchema') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set contentSchema(contentSchema: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('contentSchema', contentSchema);
  }
}

export default JSONSchema;
