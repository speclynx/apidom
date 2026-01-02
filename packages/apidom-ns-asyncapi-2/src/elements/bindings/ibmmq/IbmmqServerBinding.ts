import {
  ObjectElement,
  StringElement,
  BooleanElement,
  NumberElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class IbmmqServerBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'ibmmqServerBinding';
    this.classes.push('server-binding');
  }

  get groupId(): StringElement | undefined {
    return this.get('groupId') as StringElement | undefined;
  }

  set groupId(groupId: StringElement | undefined) {
    this.set('groupId', groupId);
  }

  get ccdtQueueManagerName(): StringElement | undefined {
    return this.get('ccdtQueueManagerName') as StringElement | undefined;
  }

  set ccdtQueueManagerName(ccdtQueueManagerName: StringElement | undefined) {
    this.set('ccdtQueueManagerName', ccdtQueueManagerName);
  }

  get cipherSpec(): StringElement | undefined {
    return this.get('cipherSpec') as StringElement | undefined;
  }

  set cipherSpec(cipherSpec: StringElement | undefined) {
    this.set('cipherSpec', cipherSpec);
  }

  get multiEndpointServer(): BooleanElement | undefined {
    return this.get('multiEndpointServer') as BooleanElement | undefined;
  }

  set multiEndpointServer(multiEndpointServer: BooleanElement | undefined) {
    this.set('multiEndpointServer', multiEndpointServer);
  }

  get heartBeatInterval(): NumberElement | undefined {
    return this.get('heartBeatInterval') as NumberElement | undefined;
  }

  set heartBeatInterval(heartBeatInterval: NumberElement | undefined) {
    this.set('heartBeatInterval', heartBeatInterval);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default IbmmqServerBinding;
