import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

import ComponentsInputsElement from './nces/ComponentsInputs.ts';
import ComponentsParametersElement from './nces/ComponentsParameters.ts';
import ComponentsSuccessActionsElement from './nces/ComponentsSuccessActions.ts';
import ComponentsFailureActionsElement from './nces/ComponentsFailureActions.ts';

/**
 * @public
 */
class Components extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'components';
  }

  get inputs(): ComponentsInputsElement | undefined {
    return this.get('inputs') as ComponentsInputsElement | undefined;
  }

  set inputs(inputs: ComponentsInputsElement | undefined) {
    this.set('inputs', inputs);
  }

  get parameters(): ComponentsParametersElement | undefined {
    return this.get('parameters') as ComponentsParametersElement | undefined;
  }

  set parameters(parameters: ComponentsParametersElement | undefined) {
    this.set('parameters', parameters);
  }

  get successActions(): ComponentsSuccessActionsElement | undefined {
    return this.get('successActions') as ComponentsSuccessActionsElement | undefined;
  }

  set successActions(successActions: ComponentsSuccessActionsElement | undefined) {
    this.set('successActions', successActions);
  }

  get failureActions(): ComponentsFailureActionsElement | undefined {
    return this.get('failureActions') as ComponentsFailureActionsElement | undefined;
  }

  set failureActions(failureActions: ComponentsFailureActionsElement | undefined) {
    this.set('failureActions', failureActions);
  }
}

export default Components;
