import { ObjectElement, StringElement, Attributes, Meta } from '@speclynx/apidom-core';

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
    return this.get('name');
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get type(): StringElement | undefined {
    return this.get('type');
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get workflowId(): StringElement | undefined {
    return this.get('workflowId');
  }

  set workflowId(workflowId: StringElement | undefined) {
    this.set('workflowId', workflowId);
  }

  get stepId(): StringElement | undefined {
    return this.get('stepId');
  }

  set stepId(stepId: StringElement | undefined) {
    this.set('stepId', stepId);
  }

  get criteria(): SuccessActionCriteriaElement | undefined {
    return this.get('criteria');
  }

  set criteria(criteria: SuccessActionCriteriaElement | undefined) {
    this.set('criteria', criteria);
  }
}

export default SuccessAction;
