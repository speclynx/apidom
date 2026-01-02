import {
  Element,
  StringElement,
  NumberElement,
  BooleanElement,
  ArrayElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';
import { JSONSchemaElement, JSONReferenceElement } from '@speclynx/apidom-ns-json-schema-draft-4';

/**
 * @public
 */
class JSONSchema extends JSONSchemaElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'JSONSchemaDraft6';
  }

  /**
   * Core vocabulary
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-01
   */

  override get idField(): StringElement | undefined {
    throw new UnsupportedOperationError('id keyword from Core vocabulary has been renamed to $id.');
  }

  override set idField(id: StringElement | undefined) {
    throw new UnsupportedOperationError('id keyword from Core vocabulary has been renamed to $id.');
  }

  get $id(): StringElement | undefined {
    return this.get('$id') as StringElement | undefined;
  }

  set $id($id: StringElement | undefined) {
    this.set('$id', $id);
  }

  /**
   * Validation vocabulary
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-01
   */

  /**
   *  Validation keywords for numeric instances (number and integer)
   */

  override get exclusiveMaximum(): NumberElement | undefined {
    return this.get('exclusiveMaximum') as NumberElement | undefined;
  }

  override set exclusiveMaximum(exclusiveMaximum: NumberElement | undefined) {
    this.set('exclusiveMaximum', exclusiveMaximum);
  }

  override get exclusiveMinimum(): NumberElement | undefined {
    return this.get('exclusiveMinimum') as NumberElement | undefined;
  }

  override set exclusiveMinimum(exclusiveMinimum: NumberElement | undefined) {
    this.set('exclusiveMinimum', exclusiveMinimum);
  }

  /**
   * Validation keywords for arrays
   */

  get containsField(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('contains') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set containsField(contains: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('contains', contains);
  }

  // @ts-expect-error - widening type to include BooleanElement (boolean schemas introduced in draft-6)
  get itemsField():
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

  // @ts-expect-error - widening type to include BooleanElement (boolean schemas introduced in draft-6)
  set itemsField(
    items:
      | this
      | BooleanElement
      | JSONReferenceElement
      | ArrayElement<this | BooleanElement | JSONReferenceElement>
      | undefined,
  ) {
    this.set('items', items);
  }

  /**
   * Validation keywords for objects
   */

  get propertyNames(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('propertyNames') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set propertyNames(propertyNames: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('propertyNames', propertyNames);
  }

  /**
   *  Validation keywords for any instance type
   */

  get const(): Element | undefined {
    return this.get('const') as Element | undefined;
  }

  set const(constValue: Element | undefined) {
    this.set('const', constValue);
  }

  // @ts-expect-error - widening type to include BooleanElement (boolean schemas introduced in draft-6)
  get not(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('not') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  // @ts-expect-error - widening type to include BooleanElement (boolean schemas introduced in draft-6)
  set not(not: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('not', not);
  }

  /**
   * Metadata keywords
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-01#section-7
   */

  get examples(): ArrayElement<Element> | undefined {
    return this.get('examples') as ArrayElement<Element> | undefined;
  }

  set examples(examples: ArrayElement<Element> | undefined) {
    this.set('examples', examples);
  }
}

export default JSONSchema;
