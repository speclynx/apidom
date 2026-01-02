import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import RequestBodyElement from './RequestBody.ts';
import StepParametersElement from './nces/StepParameters.ts';
import StepSuccessCriteriaElement from './nces/StepSuccessCriteria.ts';
import StepOnSuccessElement from './nces/StepOnSuccess.ts';
import StepOnFailureElement from './nces/StepOnFailure.ts';
import StepOutputsElement from './nces/StepOutputs.ts';

/**
 * @public
 */
class Step extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'step';
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get stepId(): StringElement | undefined {
    return this.get('stepId') as StringElement | undefined;
  }

  set stepId(stepId: StringElement | undefined) {
    this.set('stepId', stepId);
  }

  get operationId(): StringElement | undefined {
    return this.get('operationId') as StringElement | undefined;
  }

  set operationId(operationId: StringElement | undefined) {
    this.set('operationId', operationId);
  }

  get operationPath(): StringElement | undefined {
    return this.get('operationPath') as StringElement | undefined;
  }

  set operationPath(operationPath: StringElement | undefined) {
    this.set('operationPath', operationPath);
  }

  get workflowId(): StringElement | undefined {
    return this.get('workflowId') as StringElement | undefined;
  }

  set workflowId(workflowId: StringElement | undefined) {
    this.set('workflowId', workflowId);
  }

  get parameters(): StepParametersElement | undefined {
    return this.get('parameters') as StepParametersElement | undefined;
  }

  set parameters(parameters: StepParametersElement | undefined) {
    this.set('parameters', parameters);
  }

  get requestBody(): RequestBodyElement | undefined {
    return this.get('requestBody') as RequestBodyElement | undefined;
  }

  set requestBody(requestBody: RequestBodyElement | undefined) {
    this.set('requestBody', requestBody);
  }

  get successCriteria(): StepSuccessCriteriaElement | undefined {
    return this.get('successCriteria') as StepSuccessCriteriaElement | undefined;
  }

  set successCriteria(successCriteria: StepSuccessCriteriaElement | undefined) {
    this.set('successCriteria', successCriteria);
  }

  get onSuccess(): StepOnSuccessElement | undefined {
    return this.get('onSuccess') as StepOnSuccessElement | undefined;
  }

  set onSuccess(onSuccess: StepOnSuccessElement | undefined) {
    this.set('onSuccess', onSuccess);
  }

  get onFailure(): StepOnFailureElement | undefined {
    return this.get('onFailure') as StepOnFailureElement | undefined;
  }

  set onFailure(onFailure: StepOnFailureElement | undefined) {
    this.set('onFailure', onFailure);
  }

  get outputs(): StepOutputsElement | undefined {
    return this.get('outputs') as StepOutputsElement | undefined;
  }

  set outputs(outputs: StepOutputsElement | undefined) {
    this.set('outputs', outputs);
  }
}

export default Step;
