import { NamespacePluginOptions } from '@speclynx/apidom-core';

import ArazzoElement from './elements/Arazzo.ts';
import ArazzoSpecification1Element from './elements/ArazzoSpecification1.ts';
import ComponentsElement from './elements/Components.ts';
import CriterionElement from './elements/Criterion.ts';
import CriterionExpressionTypeElement from './elements/CriterionExpressionType.ts';
import FailureActionElement from './elements/FailureAction.ts';
import InfoElement from './elements/Info.ts';
import JSONSchemaElement from './elements/JSONSchema.ts';
import ParameterElement from './elements/Parameter.ts';
import PayloadReplacementElement from './elements/PayloadReplacement.ts';
import RequestBodyElement from './elements/RequestBody.ts';
import ReusableElement from './elements/Reusable.ts';
import SourceDescriptionElement from './elements/SourceDescription.ts';
import StepElement from './elements/Step.ts';
import SuccessActionElement from './elements/SuccessAction.ts';
import WorkflowElement from './elements/Workflow.ts';

/**
 * @public
 */
const arazzo1 = {
  namespace: (options: NamespacePluginOptions) => {
    const { base } = options;

    base.register('arazzo', ArazzoElement);
    base.register('arazzoSpecification1', ArazzoSpecification1Element);
    base.register('components', ComponentsElement);
    base.register('criterion', CriterionElement);
    base.register('criterionExpressionType', CriterionExpressionTypeElement);
    base.register('failureAction', FailureActionElement);
    base.register('info', InfoElement);
    base.register('parameter', ParameterElement);
    base.register('payloadReplacement', PayloadReplacementElement);
    base.register('requestBody', RequestBodyElement);
    base.register('reusable', ReusableElement);
    base.register('sourceDescription', SourceDescriptionElement);
    base.register('step', StepElement);
    base.register('successAction', SuccessActionElement);
    base.register('workflow', WorkflowElement);
    base.register('jSONSchema202012', JSONSchemaElement);

    return base;
  },
};

export default arazzo1;
