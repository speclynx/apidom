import {
  StringElement,
  ObjectElement,
  BooleanElement,
  NumberElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class MqttOperationBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'mqttOperationBinding';
    this.classes.push('operation-binding');
  }

  get qos(): NumberElement | undefined {
    return this.get('qos') as NumberElement | undefined;
  }

  set qos(qos: NumberElement | undefined) {
    this.set('qos', qos);
  }

  get retain(): BooleanElement | undefined {
    return this.get('retain') as BooleanElement | undefined;
  }

  set retain(retain: BooleanElement | undefined) {
    this.set('retain', retain);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default MqttOperationBinding;
