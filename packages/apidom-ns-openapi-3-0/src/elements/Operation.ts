import {
  ObjectElement,
  ArrayElement,
  BooleanElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ReferenceElement from './Reference.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';
import RequestBodyElement from './RequestBody.ts';
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

  get requestBody(): RequestBodyElement | ReferenceElement | undefined {
    return this.get('requestBody') as RequestBodyElement | ReferenceElement | undefined;
  }

  set requestBody(requestBody: RequestBodyElement | ReferenceElement | undefined) {
    this.set('requestBody', requestBody);
  }

  get responses(): ResponsesElement | undefined {
    return this.get('responses') as ResponsesElement | undefined;
  }

  set responses(responses: ResponsesElement | undefined) {
    this.set('responses', responses);
  }

  get callbacks(): ObjectElement | undefined {
    return this.get('callbacks') as ObjectElement | undefined;
  }

  set callbacks(callbacks: ObjectElement | undefined) {
    this.set('callbacks', callbacks);
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

  get servers(): ArrayElement | undefined {
    return this.get('severs') as ArrayElement | undefined;
  }

  set servers(servers: ArrayElement | undefined) {
    this.set('servers', servers);
  }
}

export default Operation;
