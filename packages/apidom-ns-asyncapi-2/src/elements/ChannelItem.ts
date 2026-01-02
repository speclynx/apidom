import {
  StringElement,
  ObjectElement,
  ArrayElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import OperationElement from './Operation.ts';
import ParametersElement from './Parameters.ts';
import ChannelBindingsElement from './ChannelBindings.ts';

/**
 * @public
 */
class ChannelItem extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'channelItem';
  }

  get $ref(): StringElement | undefined {
    return this.get('$ref') as StringElement | undefined;
  }

  set $ref($ref: StringElement | undefined) {
    this.set('$ref', $ref);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get servers(): ArrayElement | undefined {
    return this.get('servers') as ArrayElement | undefined;
  }

  set servers(servers: ArrayElement | undefined) {
    this.set('servers', servers);
  }

  get subscribe(): OperationElement | undefined {
    return this.get('subscribe') as OperationElement | undefined;
  }

  set subscribe(subscribe: OperationElement | undefined) {
    this.set('subscribe', subscribe);
  }

  get publish(): OperationElement | undefined {
    return this.get('publish') as OperationElement | undefined;
  }

  set publish(publish: OperationElement | undefined) {
    this.set('publish', publish);
  }

  get parameters(): ParametersElement | undefined {
    return this.get('parameters') as ParametersElement | undefined;
  }

  set parameters(parameters: ParametersElement | undefined) {
    this.set('parameters', parameters);
  }

  get bindings(): ChannelBindingsElement | undefined {
    return this.get('bindings') as ChannelBindingsElement | undefined;
  }

  set bindings(bindings: ChannelBindingsElement | undefined) {
    this.set('bindings', bindings);
  }
}

export default ChannelItem;
