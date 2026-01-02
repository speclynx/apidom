import {
  StringElement,
  ArrayElement,
  BooleanElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';
import { JSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2019-09';

import type { FixedField } from '../refractor/inspect.ts';

/**
 * @public
 */
class JSONSchema extends JSONSchemaElement {
  declare static fixedFields: FixedField[];

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'JSONSchema202012';
  }

  /**
   * Core vocabulary
   *
   * URI: https://json-schema.org/draft/2020-12/vocab/core
   */

  get $dynamicAnchor(): StringElement | undefined {
    return this.get('$dynamicAnchor') as StringElement | undefined;
  }

  set $dynamicAnchor($dynamicAnchor: StringElement | undefined) {
    this.set('$dynamicAnchor', $dynamicAnchor);
  }

  get $recursiveAnchor(): BooleanElement | undefined {
    throw new UnsupportedOperationError(
      '$recursiveAnchor keyword from Core vocabulary has been renamed to $dynamicAnchor.',
    );
  }

  set $recursiveAnchor($recursiveAnchor: BooleanElement | undefined) {
    throw new UnsupportedOperationError(
      '$recursiveAnchor keyword from Core vocabulary has been renamed to $dynamicAnchor.',
    );
  }

  get $dynamicRef(): StringElement | undefined {
    return this.get('$dynamicRef') as StringElement | undefined;
  }

  set $dynamicRef($dynamicRef: StringElement | undefined) {
    this.set('$dynamicRef', $dynamicRef);
  }

  get $recursiveRef(): StringElement | undefined {
    throw new UnsupportedOperationError(
      '$recursiveRef keyword from Core vocabulary has been renamed to $dynamicRef.',
    );
  }

  set $recursiveRef($recursiveRef: StringElement | undefined) {
    throw new UnsupportedOperationError(
      '$recursiveRef keyword from Core vocabulary has been renamed to $dynamicRef.',
    );
  }

  /**
   * Applicator vocabulary
   *
   * URI: https://json-schema.org/draft/2020-12/vocab/applicator
   */

  get prefixItems(): ArrayElement | undefined {
    return this.get('prefixItems') as ArrayElement | undefined;
  }

  set prefixItems(prefixItems: ArrayElement | undefined) {
    this.set('prefixItems', prefixItems);
  }
}

export default JSONSchema;
