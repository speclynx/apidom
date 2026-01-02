import {
  ObjectElement,
  ArrayElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ServerVariable extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'serverVariable';
  }

  get enum(): ArrayElement | undefined {
    return this.get('enum') as ArrayElement | undefined;
  }

  set enum(value: ArrayElement | undefined) {
    this.set('enum', value);
  }

  get default(): StringElement | undefined {
    return this.get('default') as StringElement | undefined;
  }

  set default(value: StringElement | undefined) {
    this.set('default', value);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }
}

export default ServerVariable;
