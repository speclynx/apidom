import {
  StringElement,
  BooleanElement,
  ArrayElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';
import {
  JSONSchemaElement,
  JSONReferenceElement,
  MediaElement,
} from '@speclynx/apidom-ns-json-schema-draft-6';

/**
 * @public
 */
class JSONSchema extends JSONSchemaElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'JSONSchemaDraft7';
  }

  /**
   * Core vocabulary
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01
   */

  get $comment(): StringElement | undefined {
    return this.get('$comment') as StringElement | undefined;
  }

  set $comment($comment: StringElement | undefined) {
    this.set('$comment', $comment);
  }

  /**
   * Validation vocabulary
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01
   */

  /**
   * Validation keywords for arrays
   */

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

  /**
   * Keywords for Applying Subschemas Conditionally
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.6
   */

  get if(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('if') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set if(ifValue: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('if', ifValue);
  }

  get then(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('then') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set then(then: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('then', then);
  }

  get else(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('else') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  set else(elseValue: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('else', elseValue);
  }

  /**
   * Keywords for Applying Subschemas With Boolean Logic
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.7
   */

  override get not(): this | BooleanElement | JSONReferenceElement | undefined {
    return this.get('not') as this | BooleanElement | JSONReferenceElement | undefined;
  }

  override set not(not: this | BooleanElement | JSONReferenceElement | undefined) {
    this.set('not', not);
  }

  /**
   * String-Encoding Non-JSON Data
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-00#section-8
   */

  get contentEncoding(): StringElement | undefined {
    return this.get('contentEncoding') as StringElement | undefined;
  }

  set contentEncoding(contentEncoding: StringElement | undefined) {
    this.set('contentEncoding', contentEncoding);
  }

  get contentMediaType(): StringElement | undefined {
    return this.get('contentMediaType') as StringElement | undefined;
  }

  set contentMediaType(contentMediaType: StringElement | undefined) {
    this.set('contentMediaType', contentMediaType);
  }

  override get media(): MediaElement | undefined {
    throw new UnsupportedOperationError(
      'media keyword from Hyper-Schema vocabulary has been moved to validation vocabulary as "contentMediaType" / "contentEncoding"',
    );
  }

  override set media(_media: MediaElement | undefined) {
    throw new UnsupportedOperationError(
      'media keyword from Hyper-Schema vocabulary has been moved to validation vocabulary as "contentMediaType" / "contentEncoding"',
    );
  }

  /**
   * Schema annotations
   *
   * URI: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10
   */

  get writeOnly(): BooleanElement | undefined {
    return this.get('writeOnly') as BooleanElement | undefined;
  }

  set writeOnly(writeOnly: BooleanElement | undefined) {
    this.set('writeOnly', writeOnly);
  }
}

export default JSONSchema;
