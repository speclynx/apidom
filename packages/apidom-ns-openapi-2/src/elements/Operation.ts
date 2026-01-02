import {
  ObjectElement,
  ArrayElement,
  BooleanElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ExternalDocumentationElement from './ExternalDocumentation.ts';
import ResponsesElement from './Responses.ts';

/**
 * @public
 */
class Operation extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'operation';
  }

  get tags(): ArrayElement | undefined {
    return this.get('tags') as ArrayElement | undefined;
  }

  set tags(tags: ArrayElement | undefined) {
    this.set('tags', tags);
  }

  get summary(): StringElement | undefined {
    return this.get('summary') as StringElement | undefined;
  }

  set summary(description: StringElement | undefined) {
    this.set('summary', description);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  set externalDocs(externalDocs: ExternalDocumentationElement | undefined) {
    this.set('externalDocs', externalDocs);
  }

  get externalDocs(): ExternalDocumentationElement | undefined {
    return this.get('externalDocs') as ExternalDocumentationElement | undefined;
  }

  get operationId(): StringElement | undefined {
    return this.get('operationId') as StringElement | undefined;
  }

  set operationId(operationId: StringElement | undefined) {
    this.set('operationId', operationId);
  }

  get parameters(): ArrayElement | undefined {
    return this.get('parameters') as ArrayElement | undefined;
  }

  set parameters(parameters: ArrayElement | undefined) {
    this.set('parameters', parameters);
  }

  get responses(): ResponsesElement | undefined {
    return this.get('responses') as ResponsesElement | undefined;
  }

  set responses(responses: ResponsesElement | undefined) {
    this.set('responses', responses);
  }

  get schemes(): ArrayElement | undefined {
    return this.get('schemes') as ArrayElement | undefined;
  }

  set schemes(schemes: ArrayElement | undefined) {
    this.set('schemes', schemes);
  }

  get deprecated(): BooleanElement {
    if (this.hasKey('deprecated')) {
      return this.get('deprecated') as BooleanElement;
    }
    return new BooleanElement(false);
  }

  set deprecated(deprecated: BooleanElement) {
    this.set('deprecated', deprecated);
  }

  get security(): ArrayElement | undefined {
    return this.get('security') as ArrayElement | undefined;
  }

  set security(security: ArrayElement | undefined) {
    this.set('security', security);
  }
}

export default Operation;
