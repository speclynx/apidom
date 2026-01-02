import { specificationObj as JSONSchema202012Specification } from '@speclynx/apidom-ns-json-schema-2020-12';

import ArazzoSpecificationVisitor from './visitors/arazzo-1/index.ts';
import ArazzoSpecificationArazzoVisitor from './visitors/arazzo-1/ArazzoVisitor.ts';
import ArazzoSpecificationSourceDescriptionsVisitor from './visitors/arazzo-1/SourceDescriptionsVisitor.ts';
import ArazzoSpecificationWorkflowsVisitor from './visitors/arazzo-1/WorkflowsVisitor.ts';
import InfoVisitor from './visitors/arazzo-1/info/index.ts';
import InfoVersionVisitor from './visitors/arazzo-1/info/VersionVisitor.ts';
import SourceDescriptionVisitor from './visitors/arazzo-1/source-description/index.ts';
import SourceDescriptionUrlVisitor from './visitors/arazzo-1/source-description/UrlVisitor.ts';
import WorkflowVisitor from './visitors/arazzo-1/workflow/index.ts';
import WorkflowDependsOnVisitor from './visitors/arazzo-1/workflow/DependsOnVisitor.ts';
import WorkflowStepsVisitor from './visitors/arazzo-1/workflow/StepsVisitor.ts';
import WorkflowSuccessActionsVisitor from './visitors/arazzo-1/workflow/SuccessActionsVisitor.ts';
import WorkflowFailureActionsVisitor from './visitors/arazzo-1/workflow/FailureActionsVisitor.ts';
import WorkflowOutputsVisitor from './visitors/arazzo-1/workflow/OutputsVisitor.ts';
import WorkflowParametersVisitor from './visitors/arazzo-1/workflow/ParametersVisitor.ts';
import StepVisitor from './visitors/arazzo-1/step/index.ts';
import StepParametersVisitor from './visitors/arazzo-1/step/ParametersVisitor.ts';
import StepSuccessCriteriaVisitor from './visitors/arazzo-1/step/SuccessCriteriaVisitor.ts';
import StepOnSuccessVisitor from './visitors/arazzo-1/step/OnSuccessVisitor.ts';
import StepOnFailureVisitor from './visitors/arazzo-1/step/OnFailureVisitor.ts';
import StepOutputsVisitor from './visitors/arazzo-1/step/OutputsVisitor.ts';
import ParameterVisitor from './visitors/arazzo-1/parameter/index.ts';
import SuccessActionVisitor from './visitors/arazzo-1/success-action/index.ts';
import SuccessActionCriteriaVisitor from './visitors/arazzo-1/success-action/CriteriaVisitor.ts';
import FailureActionVisitor from './visitors/arazzo-1/failure-action/index.ts';
import FailureActionCriteriaVisitor from './visitors/arazzo-1/failure-action/CriteriaVisitor.ts';
import ComponentsVisitor from './visitors/arazzo-1/components/index.ts';
import ComponentsInputsVisitor from './visitors/arazzo-1/components/InputsVisitor.ts';
import ComponentsParametersVisitor from './visitors/arazzo-1/components/ParametersVisitor.ts';
import ComponentsSuccessActionsVisitor from './visitors/arazzo-1/components/SuccessActionsVisitor.ts';
import ComponentsFailureActionsVisitor from './visitors/arazzo-1/components/FailureActionsVisitor.ts';
import ReusableVisitor from './visitors/arazzo-1/reusable/index.ts';
import ReusableReferenceVisitor from './visitors/arazzo-1/reusable/ReferenceVisitor.ts';
import CriterionVisitor from './visitors/arazzo-1/criterion/index.ts';
import CriterionTypeVisitor from './visitors/arazzo-1/criterion/TypeVisitor.ts';
import CriterionExpressionTypeVisitor from './visitors/arazzo-1/criterion-expression-type/index.ts';
import CriterionExpressionTypeVersionVisitor from './visitors/arazzo-1/criterion-expression-type/VersionVisitor.ts';
import RequestBodyVisitor from './visitors/arazzo-1/request-body/index.ts';
import RequestBodyReplacementsVisitor from './visitors/arazzo-1/request-body/Replacements.ts';
import PayloadReplacementVisitor from './visitors/arazzo-1/payload-replacement/index.ts';
import JSONSchemaVisitor from './visitors/arazzo-1/json-schema/index.ts';
import SpecificationExtensionVisitor from './visitors/SpecificationExtensionVisitor.ts';
import FallbackVisitor from './visitors/FallbackVisitor.ts';

const {
  JSONSchema: { fixedFields: jsonSchemaFixedFields },
} = JSONSchema202012Specification.visitors.document.objects;

/**
 * Specification object allows us to have complete control over visitors
 * when traversing the ApiDOM.
 * Specification also allows us to create amended refractors from
 * existing ones by manipulating it.
 *
 * Note: Specification object allows to use absolute internal JSON pointers.
 */

/**
 * @public
 */
const specification = {
  visitors: {
    value: FallbackVisitor,
    document: {
      objects: {
        ArazzoSpecification: {
          element: 'arazzoSpecification1',
          $visitor: ArazzoSpecificationVisitor,
          fixedFields: {
            arazzo: {
              element: 'arazzo',
              $visitor: ArazzoSpecificationArazzoVisitor,
            },
            info: {
              $ref: '#/visitors/document/objects/Info',
            },
            sourceDescriptions: ArazzoSpecificationSourceDescriptionsVisitor,
            workflows: ArazzoSpecificationWorkflowsVisitor,
            components: {
              $ref: '#/visitors/document/objects/Components',
            },
          },
        },
        Info: {
          element: 'info',
          $visitor: InfoVisitor,
          fixedFields: {
            title: { $ref: '#/visitors/value' },
            summary: { $ref: '#/visitors/value' },
            description: { $ref: '#/visitors/value' },
            version: InfoVersionVisitor,
          },
        },
        SourceDescription: {
          element: 'sourceDescription',
          $visitor: SourceDescriptionVisitor,
          fixedFields: {
            name: { $ref: '#/visitors/value' },
            url: SourceDescriptionUrlVisitor,
            type: { $ref: '#/visitors/value' },
          },
        },
        Workflow: {
          element: 'workflow',
          $visitor: WorkflowVisitor,
          fixedFields: {
            workflowId: { $ref: '#/visitors/value' },
            summary: { $ref: '#/visitors/value' },
            description: { $ref: '#/visitors/value' },
            inputs: JSONSchemaVisitor,
            dependsOn: WorkflowDependsOnVisitor,
            steps: WorkflowStepsVisitor,
            successActions: WorkflowSuccessActionsVisitor,
            failureActions: WorkflowFailureActionsVisitor,
            outputs: WorkflowOutputsVisitor,
            parameters: WorkflowParametersVisitor,
          },
        },
        Step: {
          element: 'step',
          $visitor: StepVisitor,
          fixedFields: {
            description: { $ref: '#/visitors/value' },
            stepId: { $ref: '#/visitors/value' },
            operationId: { $ref: '#/visitors/value' },
            operationPath: { $ref: '#/visitors/value' },
            workflowId: { $ref: '#/visitors/value' },
            parameters: StepParametersVisitor,
            requestBody: {
              $ref: '#/visitors/document/objects/RequestBody',
            },
            successCriteria: StepSuccessCriteriaVisitor,
            onSuccess: StepOnSuccessVisitor,
            onFailure: StepOnFailureVisitor,
            outputs: StepOutputsVisitor,
          },
        },
        Parameter: {
          element: 'parameter',
          $visitor: ParameterVisitor,
          fixedFields: {
            name: { $ref: '#/visitors/value' },
            in: { $ref: '#/visitors/value' },
            value: { $ref: '#/visitors/value' },
          },
        },
        SuccessAction: {
          element: 'successAction',
          $visitor: SuccessActionVisitor,
          fixedFields: {
            name: { $ref: '#/visitors/value' },
            type: { $ref: '#/visitors/value' },
            workflowId: { $ref: '#/visitors/value' },
            stepId: { $ref: '#/visitors/value' },
            criteria: SuccessActionCriteriaVisitor,
          },
        },
        FailureAction: {
          element: 'failureAction',
          $visitor: FailureActionVisitor,
          fixedFields: {
            name: { $ref: '#/visitors/value' },
            type: { $ref: '#/visitors/value' },
            workflowId: { $ref: '#/visitors/value' },
            stepId: { $ref: '#/visitors/value' },
            retryAfter: { $ref: '#/visitors/value' },
            retryLimit: { $ref: '#/visitors/value' },
            criteria: FailureActionCriteriaVisitor,
          },
        },
        Components: {
          element: 'components',
          $visitor: ComponentsVisitor,
          fixedFields: {
            inputs: ComponentsInputsVisitor,
            parameters: ComponentsParametersVisitor,
            successActions: ComponentsSuccessActionsVisitor,
            failureActions: ComponentsFailureActionsVisitor,
          },
        },
        Reusable: {
          element: 'reusable',
          $visitor: ReusableVisitor,
          fixedFields: {
            reference: ReusableReferenceVisitor,
            value: { $ref: '#/visitors/value' },
          },
        },
        Criterion: {
          element: 'criterion',
          $visitor: CriterionVisitor,
          fixedFields: {
            context: { $ref: '#/visitors/value' },
            condition: { $ref: '#/visitors/value' },
            type: CriterionTypeVisitor,
          },
        },
        CriterionExpressionType: {
          element: 'criterionExpressionType',
          $visitor: CriterionExpressionTypeVisitor,
          fixedFields: {
            type: { $ref: '#/visitors/value' },
            version: CriterionExpressionTypeVersionVisitor,
          },
        },
        RequestBody: {
          element: 'requestBody',
          $visitor: RequestBodyVisitor,
          fixedFields: {
            contentType: { $ref: '#/visitors/value' },
            payload: { $ref: '#/visitors/value' },
            replacements: RequestBodyReplacementsVisitor,
          },
        },
        PayloadReplacement: {
          element: 'payloadReplacement',
          $visitor: PayloadReplacementVisitor,
          fixedFields: {
            target: { $ref: '#/visitors/value' },
            value: { $ref: '#/visitors/value' },
          },
        },
        JSONSchema: {
          element: 'jSONSchema202012',
          $visitor: JSONSchemaVisitor,
          fixedFields: {
            ...jsonSchemaFixedFields,
          },
        },
      },
      extension: {
        $visitor: SpecificationExtensionVisitor,
      },
    },
  },
} as const;

export default specification;
