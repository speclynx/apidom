import {
  ObjectElement,
  StringElement,
  NumberElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-core';

import FailureActionCriteriaElement from './nces/FailureActionCriteria.ts';

/**
 * @public
 */
class FailureAction extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'failureAction';
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

  get retryAfter(): NumberElement | undefined {
    return this.get('retryAfter');
  }

  set retryAfter(retryAfter: NumberElement | undefined) {
    this.set('retryAfter', retryAfter);
  }

  get retryLimit(): NumberElement | undefined {
    return this.get('retryLimit');
  }

  set retryLimit(retryLimit: NumberElement | undefined) {
    this.set('retryLimit', retryLimit);
  }

  get criteria(): FailureActionCriteriaElement | undefined {
    return this.get('criteria');
  }

  set criteria(criteria: FailureActionCriteriaElement | undefined) {
    this.set('criteria', criteria);
  }
}

export default FailureAction;
