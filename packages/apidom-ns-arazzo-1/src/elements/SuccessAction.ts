import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import SuccessActionCriteriaElement from './nces/SuccessActionCriteria.ts';

/**
 * @public
 */
class SuccessAction extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'successAction';
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get type(): StringElement | undefined {
    return this.get('type') as StringElement | undefined;
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get workflowId(): StringElement | undefined {
    return this.get('workflowId') as StringElement | undefined;
  }

  set workflowId(workflowId: StringElement | undefined) {
    this.set('workflowId', workflowId);
  }

  get stepId(): StringElement | undefined {
    return this.get('stepId') as StringElement | undefined;
  }

  set stepId(stepId: StringElement | undefined) {
    this.set('stepId', stepId);
  }

  get criteria(): SuccessActionCriteriaElement | undefined {
    return this.get('criteria') as SuccessActionCriteriaElement | undefined;
  }

  set criteria(criteria: SuccessActionCriteriaElement | undefined) {
    this.set('criteria', criteria);
  }
}

export default SuccessAction;
