import { ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  JSONSchemaVisitor as JSONSchema202012Visitor,
  JSONSchemaVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';

import JSONSchemaElement from '../../../../elements/JSONSchema.ts';

export type { JSONSchemaVisitorOptions };

/**
 * @public
 */
class JSONSchemaVisitor extends JSONSchema202012Visitor {
  declare public element: JSONSchemaElement;

  constructor(options: JSONSchemaVisitorOptions) {
    super(options);
    this.element = new JSONSchemaElement();
  }

  ObjectElement(path: Path<ObjectElement>) {
    super.ObjectElement(path);

    // the inherited visitor tags `schema`, which no Arazzo element is named;
    // consumers match this value against an element name, so mirror our own
    if (isStringElement(this.element.$ref)) {
      this.element.meta.set('referenced-element', this.element.element);
    }
  }
}

export default JSONSchemaVisitor;
