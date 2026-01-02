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
class MqttServerBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'mqttServerBinding';
    this.classes.push('server-binding');
  }

  get clientId(): StringElement | undefined {
    return this.get('clientId') as StringElement | undefined;
  }

  set clientId(clientId: StringElement | undefined) {
    this.set('clientId', clientId);
  }

  get cleanSession(): BooleanElement | undefined {
    return this.get('cleanSession') as BooleanElement | undefined;
  }

  set cleanSession(cleanSession: BooleanElement | undefined) {
    this.set('cleanSession', cleanSession);
  }

  get lastWill(): ObjectElement | undefined {
    return this.get('lastWill') as ObjectElement | undefined;
  }

  set lastWill(lastWill: ObjectElement | undefined) {
    this.set('lastWill', lastWill);
  }

  get keepAlive(): NumberElement | undefined {
    return this.get('keepAlive') as NumberElement | undefined;
  }

  set keepAlive(keepAlive: NumberElement | undefined) {
    this.set('keepAlive', keepAlive);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default MqttServerBinding;
