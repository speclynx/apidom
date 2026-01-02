import { BooleanElement, Attributes, Meta } from '@speclynx/apidom-datamodel';
import { LinkDescriptionElement } from '@speclynx/apidom-ns-json-schema-draft-7';

import JSONSchema from './JSONSchema.ts';
import type { FixedField } from '../refractor/inspect.ts';

/**
 * URI: https://json-schema.org/draft/2019-09/draft-handrews-json-schema-hyperschema-02#rfc.section.6
 * @public
 */

class LinkDescription extends LinkDescriptionElement {
  declare static fixedFields: FixedField[];

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'linkDescription';
  }

  /**
   *  Link Target Attributes.
   *
   *  URI: https://json-schema.org/draft/2019-09/draft-handrews-json-schema-hyperschema-02#rfc.section.6.5
   */
  get targetSchema(): JSONSchema | BooleanElement | undefined {
    return this.get('targetSchema') as JSONSchema | BooleanElement | undefined;
  }

  set targetSchema(targetSchema: JSONSchema | BooleanElement | undefined) {
    this.set('targetSchema', targetSchema);
  }

  /**
   *  Link Input.
   *
   *  URI: https://json-schema.org/draft/2019-09/draft-handrews-json-schema-hyperschema-02#input
   */
  get hrefSchema(): JSONSchema | BooleanElement | undefined {
    return this.get('hrefSchema') as JSONSchema | BooleanElement | undefined;
  }

  set hrefSchema(hrefSchema: JSONSchema | BooleanElement | undefined) {
    this.set('hrefSchema', hrefSchema);
  }

  get headerSchema(): JSONSchema | BooleanElement | undefined {
    return this.get('headerSchema') as JSONSchema | BooleanElement | undefined;
  }

  set headerSchema(headerSchema: JSONSchema | BooleanElement | undefined) {
    this.set('headerSchema', headerSchema);
  }

  get submissionSchema(): JSONSchema | BooleanElement | undefined {
    return this.get('submissionSchema') as JSONSchema | BooleanElement | undefined;
  }

  set submissionSchema(submissionSchema: JSONSchema | BooleanElement | undefined) {
    this.set('submissionSchema', submissionSchema);
  }
}

export default LinkDescription;
