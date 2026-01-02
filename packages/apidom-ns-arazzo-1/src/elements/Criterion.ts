import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import CriterionExpressionTypeElement from './CriterionExpressionType.ts';

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

  get type(): StringElement | CriterionExpressionTypeElement | undefined {
    return this.get('type') as StringElement | CriterionExpressionTypeElement | undefined;
  }

  set type(type: StringElement | CriterionExpressionTypeElement | undefined) {
    this.set('type', type);
  }
}

export default Criterion;
