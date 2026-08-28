import {
  ObjectElement,
  StringElement,
  NumberElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import RequestBodyElement from './RequestBody.ts';
import StepParametersElement from './nces/StepParameters.ts';
import StepSuccessCriteriaElement from './nces/StepSuccessCriteria.ts';
import StepOnSuccessElement from './nces/StepOnSuccess.ts';
import StepOnFailureElement from './nces/StepOnFailure.ts';
import StepOutputsElement from './nces/StepOutputs.ts';
import StepDependsOnElement from './nces/StepDependsOn.ts';

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

  get channelPath(): StringElement | undefined {
    return this.get('channelPath') as StringElement | undefined;
  }

  set channelPath(channelPath: StringElement | undefined) {
    this.set('channelPath', channelPath);
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

  get timeout(): NumberElement | undefined {
    return this.get('timeout') as NumberElement | undefined;
  }

  set timeout(timeout: NumberElement | undefined) {
    this.set('timeout', timeout);
  }

  get correlationId(): StringElement | undefined {
    return this.get('correlationId') as StringElement | undefined;
  }

  set correlationId(correlationId: StringElement | undefined) {
    this.set('correlationId', correlationId);
  }

  get action(): StringElement | undefined {
    return this.get('action') as StringElement | undefined;
  }

  set action(action: StringElement | undefined) {
    this.set('action', action);
  }

  get dependsOn(): StepDependsOnElement | undefined {
    return this.get('dependsOn') as StepDependsOnElement | undefined;
  }

  set dependsOn(dependsOn: StepDependsOnElement | undefined) {
    this.set('dependsOn', dependsOn);
  }
}

export default Step;
