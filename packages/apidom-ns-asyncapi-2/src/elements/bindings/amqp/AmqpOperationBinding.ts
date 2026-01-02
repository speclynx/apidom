import {
  StringElement,
  ObjectElement,
  NumberElement,
  ArrayElement,
  BooleanElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class AmqpOperationBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'amqpOperationBinding';
    this.classes.push('operation-binding');
  }

  get expiration(): NumberElement | undefined {
    return this.get('expiration') as NumberElement | undefined;
  }

  set expiration(expiration: NumberElement | undefined) {
    this.set('expiration', expiration);
  }

  get userId(): StringElement | undefined {
    return this.get('userId') as StringElement | undefined;
  }

  set userId(userId: StringElement | undefined) {
    this.set('userId', userId);
  }

  get cc(): ArrayElement | undefined {
    return this.get('cc') as ArrayElement | undefined;
  }

  set cc(cc: ArrayElement | undefined) {
    this.set('cc', cc);
  }

  get priority(): NumberElement | undefined {
    return this.get('priority') as NumberElement | undefined;
  }

  set priority(priority: NumberElement | undefined) {
    this.set('priority', priority);
  }

  get deliveryMode(): NumberElement | undefined {
    return this.get('deliveryMode') as NumberElement | undefined;
  }

  set deliveryMode(deliveryMode: NumberElement | undefined) {
    this.set('deliveryMode', deliveryMode);
  }

  get mandatory(): BooleanElement | undefined {
    return this.get('mandatory') as BooleanElement | undefined;
  }

  set mandatory(mandatory: BooleanElement | undefined) {
    this.set('mandatory', mandatory);
  }

  get bcc(): ArrayElement | undefined {
    return this.get('bcc') as ArrayElement | undefined;
  }

  set bcc(bcc: ArrayElement | undefined) {
    this.set('bcc', bcc);
  }

  get replyTo(): StringElement | undefined {
    return this.get('replyTo') as StringElement | undefined;
  }

  set replyTo(replyTo: StringElement | undefined) {
    this.set('replyTo', replyTo);
  }

  get timestamp(): BooleanElement | undefined {
    return this.get('timestamp') as BooleanElement | undefined;
  }

  set timestamp(timestamp: BooleanElement | undefined) {
    this.set('timestamp', timestamp);
  }

  get ack(): BooleanElement | undefined {
    return this.get('ack') as BooleanElement | undefined;
  }

  set ack(ack: BooleanElement | undefined) {
    this.set('ack', ack);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default AmqpOperationBinding;
