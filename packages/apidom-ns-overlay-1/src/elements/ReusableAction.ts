import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ActionElement from './Action.ts';

/**
 * @public
 */
class ReusableAction extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'reusableAction';
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get fields(): ActionElement | undefined {
    return this.get('fields') as ActionElement | undefined;
  }

  set fields(fields: ActionElement | undefined) {
    this.set('fields', fields);
  }
}

export default ReusableAction;
