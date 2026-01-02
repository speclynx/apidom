import { BooleanElement, StringElement } from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';
import {
  LinkDescriptionElement,
  JSONReferenceElement,
  JSONSchemaElement,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import JSONSchema from './JSONSchema.ts';

/**
 * URI: https://datatracker.ietf.org/doc/html/draft-wright-json-schema-hyperschema-01#section-6
 * @public
 */

class LinkDescription extends LinkDescriptionElement {
  get hrefSchema(): JSONSchema | BooleanElement | JSONReferenceElement | undefined {
    return this.get('hrefSchema') as JSONSchema | BooleanElement | JSONReferenceElement | undefined;
  }

  set hrefSchema(hrefSchema: JSONSchema | BooleanElement | JSONReferenceElement | undefined) {
    this.set('hrefSchema', hrefSchema);
  }

  // @ts-expect-error - widening type to include BooleanElement (boolean schemas introduced in draft-6)
  override get targetSchema(): JSONSchema | BooleanElement | JSONReferenceElement | undefined {
    return this.get('targetSchema') as
      | JSONSchema
      | BooleanElement
      | JSONReferenceElement
      | undefined;
  }

  // @ts-expect-error - widening type to include BooleanElement (boolean schemas introduced in draft-6)
  override set targetSchema(
    targetSchema: JSONSchema | BooleanElement | JSONReferenceElement | undefined,
  ) {
    this.set('targetSchema', targetSchema);
  }

  override get schema(): JSONSchemaElement | JSONReferenceElement | undefined {
    throw new UnsupportedOperationError(
      'schema keyword from Hyper-Schema vocabulary has been renamed to submissionSchema.',
    );
  }

  override set schema(schema: JSONSchemaElement | JSONReferenceElement | undefined) {
    throw new UnsupportedOperationError(
      'schema keyword from Hyper-Schema vocabulary has been renamed to submissionSchema.',
    );
  }

  get submissionSchema(): JSONSchema | BooleanElement | JSONReferenceElement | undefined {
    return this.get('submissionSchema') as
      | JSONSchema
      | BooleanElement
      | JSONReferenceElement
      | undefined;
  }

  set submissionSchema(
    submissionSchema: JSONSchema | BooleanElement | JSONReferenceElement | undefined,
  ) {
    this.set('submissionSchema', submissionSchema);
  }

  override get method(): StringElement | undefined {
    throw new UnsupportedOperationError(
      'method keyword from Hyper-Schema vocabulary has been removed.',
    );
  }

  override set method(method: StringElement | undefined) {
    throw new UnsupportedOperationError(
      'method keyword from Hyper-Schema vocabulary has been removed.',
    );
  }

  override get encType(): StringElement | undefined {
    throw new UnsupportedOperationError(
      'encType keyword from Hyper-Schema vocabulary has been renamed to submissionEncType.',
    );
  }

  override set encType(encType: StringElement | undefined) {
    throw new UnsupportedOperationError(
      'encType keyword from Hyper-Schema vocabulary has been renamed to submissionEncType.',
    );
  }

  get submissionEncType(): StringElement | undefined {
    return this.get('submissionEncType') as StringElement | undefined;
  }

  set submissionEncType(submissionEncType: StringElement | undefined) {
    this.set('submissionEncType', submissionEncType);
  }
}

export default LinkDescription;
