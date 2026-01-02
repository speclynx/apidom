import {
  StringElement,
  ObjectElement,
  ArrayElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import OperationElement from './Operation.ts';

/**
 * @public
 */
class PathItem extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'pathItem';
  }

  get $ref(): StringElement | undefined {
    return this.get('$ref') as StringElement | undefined;
  }

  set $ref($ref: StringElement | undefined) {
    this.set('$ref', $ref);
  }

  get getField(): OperationElement | undefined {
    return this.get('get') as OperationElement | undefined;
  }

  set getField(operation: OperationElement | undefined) {
    this.set('get', operation);
  }

  get put(): OperationElement | undefined {
    return this.get('put') as OperationElement | undefined;
  }

  set put(operation: OperationElement | undefined) {
    this.set('put', operation);
  }

  get post(): OperationElement | undefined {
    return this.get('post') as OperationElement | undefined;
  }

  set post(operation: OperationElement | undefined) {
    this.set('post', operation);
  }

  get deleteField(): OperationElement | undefined {
    return this.get('delete') as OperationElement | undefined;
  }

  set deleteField(operation: OperationElement | undefined) {
    this.set('delete', operation);
  }

  get options(): OperationElement | undefined {
    return this.get('options') as OperationElement | undefined;
  }

  set options(operation: OperationElement | undefined) {
    this.set('options', operation);
  }

  get head(): OperationElement | undefined {
    return this.get('head') as OperationElement | undefined;
  }

  set head(operation: OperationElement | undefined) {
    this.set('head', operation);
  }

  get patch(): OperationElement | undefined {
    return this.get('patch') as OperationElement | undefined;
  }

  set patch(operation: OperationElement | undefined) {
    this.set('patch', operation);
  }

  get parameters(): ArrayElement {
    return this.get('parameters') as ArrayElement;
  }

  set parameters(parameters: ArrayElement | undefined) {
    this.set('parameters', parameters);
  }
}

export default PathItem;
