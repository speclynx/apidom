import {
  ArrayElement,
  StringElement,
  BooleanElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';
import { JSONSchemaElement } from '@speclynx/apidom-ns-json-schema-draft-7';

import ReferenceElement from './Reference.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';

/**
 * @public
 */
class Schema extends JSONSchemaElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'schema';
    this.classes.push('json-schema-draft-7');
  }

  /**
   * Validation vocabulary
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01
   */

  /**
   *  Validation Keywords for Applying Subschemas With Boolean Logic
   *
   *  URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.7
   */

  get not(): this | BooleanElement | ReferenceElement | undefined | any {
    return this.get('not') as this | BooleanElement | ReferenceElement | undefined | any;
  }

  /**
   *  Validation Keywords for Applying Subschemas Conditionally
   *
   *  URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.6
   */

  get if(): this | BooleanElement | ReferenceElement | undefined {
    return this.get('if') as this | BooleanElement | ReferenceElement | undefined;
  }

  set if(ifValue: this | BooleanElement | ReferenceElement | undefined) {
    this.set('if', ifValue);
  }

  get then(): this | BooleanElement | ReferenceElement | undefined {
    return this.get('then') as this | BooleanElement | ReferenceElement | undefined;
  }

  set then(then: this | BooleanElement | ReferenceElement | undefined) {
    this.set('then', then);
  }

  get else(): this | BooleanElement | ReferenceElement | undefined {
    return this.get('else') as this | BooleanElement | ReferenceElement | undefined;
  }

  set else(elseValue: this | BooleanElement | ReferenceElement | undefined) {
    this.set('else', elseValue);
  }

  /**
   * Validation Keywords for Arrays
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.4
   */

  override get itemsField():
    | this
    | BooleanElement
    | ReferenceElement
    | ArrayElement
    | undefined
    | any {
    return this.get('items') as
      | this
      | BooleanElement
      | ReferenceElement
      | ArrayElement
      | undefined
      | any;
  }

  override set itemsField(
    items: this | BooleanElement | ReferenceElement | ArrayElement | undefined | any,
  ) {
    this.set('items', items);
  }

  get additionalItems(): this | BooleanElement | ReferenceElement | undefined {
    return this.get('additionalItems') as this | BooleanElement | ReferenceElement | undefined;
  }

  set additionalItems(additionalItems: this | BooleanElement | ReferenceElement | undefined) {
    this.set('additionalItems', additionalItems);
  }

  get contains(): this | BooleanElement | ReferenceElement | undefined {
    return this.get('contains') as this | BooleanElement | ReferenceElement | undefined;
  }

  set contains(contains: this | BooleanElement | ReferenceElement | undefined) {
    this.set('contains', contains);
  }

  /**
   * Validation Keywords for Objects
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.5
   */

  get propertyNames(): this | BooleanElement | ReferenceElement | undefined {
    return this.get('propertyNames') as this | BooleanElement | ReferenceElement | undefined;
  }

  set propertyNames(propertyNames: this | BooleanElement | ReferenceElement | undefined) {
    this.set('propertyNames', propertyNames);
  }

  /**
   * AsyncAPI vocabulary
   *
   * URI: https://github.com/asyncapi/spec/blob/master/spec/asyncapi.md#fixed-fields-21
   */

  get discriminator(): StringElement | undefined {
    return this.get('discriminator') as StringElement | undefined;
  }

  get externalDocs(): ExternalDocumentationElement | undefined {
    return this.get('externalDocs') as ExternalDocumentationElement | undefined;
  }

  get deprecated(): BooleanElement | undefined {
    return this.get('deprecated') as BooleanElement | undefined;
  }
}

export default Schema;
