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
class Criterion extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'criterion';
  }

  get context(): StringElement | undefined {
    return this.get('context') as StringElement | undefined;
  }

  set context(context: StringElement | undefined) {
    this.set('context', context);
  }

  get condition(): StringElement | undefined {
    return this.get('condition') as StringElement | undefined;
  }

  set condition(condition: StringElement | undefined) {
    this.set('condition', condition);
  }

  get type(): StringElement | ExpressionTypeElement | undefined {
    return this.get('type') as StringElement | ExpressionTypeElement | undefined;
  }

  set type(type: StringElement | ExpressionTypeElement | undefined) {
    this.set('type', type);
  }
}

export default Criterion;
