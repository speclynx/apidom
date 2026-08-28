import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import ExpressionTypeElement from './ExpressionType.ts';

/**
 * @public
 */
class Selector extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'selector';
  }

  get context(): StringElement | undefined {
    return this.get('context') as StringElement | undefined;
  }

  set context(context: StringElement | undefined) {
    this.set('context', context);
  }

  get selector(): StringElement | undefined {
    return this.get('selector') as StringElement | undefined;
  }

  set selector(selector: StringElement | undefined) {
    this.set('selector', selector);
  }

  get type(): StringElement | ExpressionTypeElement | undefined {
    return this.get('type') as StringElement | ExpressionTypeElement | undefined;
  }

  set type(type: StringElement | ExpressionTypeElement | undefined) {
    this.set('type', type);
  }
}

export default Selector;
