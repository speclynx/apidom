import {
  StringElement,
  ObjectElement,
  ArrayElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import TagsElement from './Tags.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';
import OperationBindingsElement from './OperationBindings.ts';
import ReferenceElement from './Reference.ts';

/**
 * @public
 */
class OperationTrait extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'operationTrait';
  }

  get operationId(): StringElement | undefined {
    return this.get('operationId') as StringElement | undefined;
  }

  set operationId(operationId: StringElement | undefined) {
    this.set('operationId', operationId);
  }

  get summary(): StringElement | undefined {
    return this.get('summary') as StringElement | undefined;
  }

  set summary(summary: StringElement | undefined) {
    this.set('summary', summary);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get security(): ArrayElement | undefined {
    return this.get('security') as ArrayElement | undefined;
  }

  set security(security: ArrayElement | undefined) {
    this.set('security', security);
  }

  get tags(): TagsElement | undefined {
    return this.get('tags') as TagsElement | undefined;
  }

  set tags(tags: TagsElement | undefined) {
    this.set('tags', tags);
  }

  get externalDocs(): ExternalDocumentationElement | undefined {
    return this.get('externalDocs') as ExternalDocumentationElement | undefined;
  }

  set externalDocs(externalDocs: ExternalDocumentationElement | undefined) {
    this.set('externalDocs', externalDocs);
  }

  get bindings(): OperationBindingsElement | ReferenceElement | undefined {
    return this.get('bindings') as OperationBindingsElement | ReferenceElement | undefined;
  }

  set bindings(bindings: OperationBindingsElement | ReferenceElement | undefined) {
    this.set('bindings', bindings);
  }
}

export default OperationTrait;
