import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

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
}

export default Server;
