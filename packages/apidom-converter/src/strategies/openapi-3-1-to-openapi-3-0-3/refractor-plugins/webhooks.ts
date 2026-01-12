import { OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';
import { AnnotationElement } from '@speclynx/apidom-datamodel';
import { type Path } from '@speclynx/apidom-traverse';

type WebhooksRefractorPluginOptions = {
  annotations: AnnotationElement[];
};

const webhooksRefractorPlugin =
  ({ annotations }: WebhooksRefractorPluginOptions) =>
  () => {
    const annotation = new AnnotationElement(
      'Webhooks are not supported in OpenAPI 3.0.3. They will be removed from the converted document.',
      { classes: ['warning'] },
      { code: 'webhooks' },
    );

    return {
      visitor: {
        OpenApi3_1Element(path: Path<OpenApi3_1Element>) {
          const element = path.node;
          if (!element.hasKey('webhooks')) return undefined;

          annotations.push(annotation);
          element.remove('webhooks');

          return undefined;
        },
      },
    };
  };

export default webhooksRefractorPlugin;
