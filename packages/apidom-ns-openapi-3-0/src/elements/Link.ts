import {
  ObjectElement,
  StringElement,
  Element,
  isStringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ServerElement from './Server.ts';
import OperationElement from './Operation.ts';

/**
 * @public
 */
class Link extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'link';
  }

  get operationRef(): StringElement | undefined {
    return this.get('operationRef') as StringElement | undefined;
  }

  set operationRef(operationRef: StringElement | undefined) {
    this.set('operationRef', operationRef);
  }

  get operationId(): StringElement | undefined {
    return this.get('operationId') as StringElement | undefined;
  }

  set operationId(operationId: StringElement | undefined) {
    this.set('operationId', operationId);
  }

  get operation(): OperationElement | undefined {
    if (isStringElement(this.operationRef)) {
      return this.operationRef?.meta.get('operation') as OperationElement | undefined;
    }
    if (isStringElement(this.operationId)) {
      return this.operationId?.meta.get('operation') as OperationElement | undefined;
    }
    return undefined;
  }

  set operation(operation: OperationElement | undefined) {
    this.set('operation', operation);
  }

  get parameters(): ObjectElement | undefined {
    return this.get('parameters') as ObjectElement | undefined;
  }

  set parameters(parameters: ObjectElement | undefined) {
    this.set('parameters', parameters);
  }

  get requestBody(): Element | undefined {
    return this.get('requestBody') as Element | undefined;
  }

  set requestBody(requestBody: Element | undefined) {
    this.set('requestBody', requestBody);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get server(): ServerElement | undefined {
    return this.get('server') as ServerElement | undefined;
  }

  set server(server: ServerElement | undefined) {
    this.set('server', server);
  }
}

export default Link;
