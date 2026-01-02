import {
  StringElement,
  ObjectElement,
  ArrayElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ServerBindingsElement from './ServerBindings.ts';

/**
 * @public
 */
class Server extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'server';
  }

  get url(): StringElement | undefined {
    return this.get('url') as StringElement | undefined;
  }

  set url(url: StringElement | undefined) {
    this.set('url', url);
  }

  get protocol(): StringElement | undefined {
    return this.get('protocol') as StringElement | undefined;
  }

  set protocol(protocol: StringElement | undefined) {
    this.set('protocol', protocol);
  }

  get protocolVersion(): StringElement | undefined {
    return this.get('protocolVersion') as StringElement | undefined;
  }

  set protocolVersion(protocolVersion: StringElement | undefined) {
    this.set('protocolVersion', protocolVersion);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get variables(): ObjectElement | undefined {
    return this.get('variables') as ObjectElement | undefined;
  }

  set variables(variables: ObjectElement | undefined) {
    this.set('variables', variables);
  }

  get tags(): ArrayElement | undefined {
    return this.get('tags') as ArrayElement | undefined;
  }

  set tags(tags: ArrayElement | undefined) {
    this.set('tags', tags);
  }

  get security(): ArrayElement | undefined {
    return this.get('security') as ArrayElement | undefined;
  }

  set security(security: ArrayElement | undefined) {
    this.set('security', security);
  }

  get bindings(): ServerBindingsElement | undefined {
    return this.get('bindings') as ServerBindingsElement | undefined;
  }

  set bindings(bindings: ServerBindingsElement | undefined) {
    this.set('bindings', bindings);
  }
}

export default Server;
