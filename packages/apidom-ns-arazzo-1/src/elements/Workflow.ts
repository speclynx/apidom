import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import JSONSchemaElement from './JSONSchema.ts';
import WorkflowDependsOnElement from './nces/WorkflowDependsOn.ts';
import WorkflowStepsElement from './nces/WorkflowSteps.ts';
import WorkflowSuccessActionsElement from './nces/WorkflowSuccessActions.ts';
import WorkflowFailureActionsElement from './nces/WorkflowFailureActions.ts';
import WorkflowOutputsElement from './nces/WorkflowOutputs.ts';
import WorkflowParametersElement from './nces/WorkflowParameters.ts';

/**
 * @public
 */
class Workflow extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'workflow';
  }

  get workflowId(): StringElement | undefined {
    return this.get('workflowId') as StringElement | undefined;
  }

  set workflowId(workflowId: StringElement | undefined) {
    this.set('workflowId', workflowId);
  }

  get summary(): StringElement | undefined {
    return this.get('summary') as StringElement | undefined;
  }

  set summary(summary: StringElement | undefined) {
    this.set('summary', summary);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get inputs(): JSONSchemaElement | undefined {
    return this.get('inputs') as JSONSchemaElement | undefined;
  }

  set inputs(inputs: JSONSchemaElement | undefined) {
    this.set('inputs', inputs);
  }

  get dependsOn(): WorkflowDependsOnElement | undefined {
    return this.get('dependsOn') as WorkflowDependsOnElement | undefined;
  }

  set dependsOn(dependsOn: WorkflowDependsOnElement | undefined) {
    this.set('dependsOn', dependsOn);
  }

  get steps(): WorkflowStepsElement | undefined {
    return this.get('steps') as WorkflowStepsElement | undefined;
  }

  set steps(steps: WorkflowStepsElement | undefined) {
    this.set('steps', steps);
  }

  get successActions(): WorkflowSuccessActionsElement | undefined {
    return this.get('successActions') as WorkflowSuccessActionsElement | undefined;
  }

  set successActions(successActions: WorkflowSuccessActionsElement | undefined) {
    this.set('successActions', successActions);
  }

  get failureActions(): WorkflowFailureActionsElement | undefined {
    return this.get('failureActions') as WorkflowFailureActionsElement | undefined;
  }

  set failureActions(failureActions: WorkflowFailureActionsElement | undefined) {
    this.set('failureActions', failureActions);
  }

  get outputs(): WorkflowOutputsElement | undefined {
    return this.get('outputs') as WorkflowOutputsElement | undefined;
  }

  set outputs(outputs: WorkflowOutputsElement | undefined) {
    this.set('outputs', outputs);
  }

  get parameters(): WorkflowParametersElement | undefined {
    return this.get('parameters') as WorkflowParametersElement | undefined;
  }

  set parameters(parameters: WorkflowParametersElement | undefined) {
    this.set('parameters', parameters);
  }
}

export default Workflow;
