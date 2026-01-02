import {
  ObjectElement,
  ArrayElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OperationMessageMap extends ObjectElement {
  static primaryClass = 'operation-message-map';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OperationMessageMap.primaryClass);
  }

  get oneOf(): ArrayElement | undefined {
    return this.get('oneOf') as ArrayElement | undefined;
  }

  set oneOf(oneOf: ArrayElement | undefined) {
    this.set('oneOf', oneOf);
  }
}

export default OperationMessageMap;
