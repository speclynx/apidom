import { ReferenceElement } from '@speclynx/apidom-ns-openapi-3-1';
import { AnnotationElement } from '@speclynx/apidom-datamodel';
import { type Path } from '@speclynx/apidom-traverse';

type ReferenceSummaryPluginOptions = {
  annotations: AnnotationElement[];
};

const referenceSummaryRefractorPlugin =
  ({ annotations }: ReferenceSummaryPluginOptions) =>
  () => {
    const annotation = new AnnotationElement(
      'The "summary" field of Reference Object is not supported in OpenAPI 3.0.3. It has been removed from the converted document.',
      { classes: ['warning'] },
      { code: 'reference-summary' },
    );

    return {
      visitor: {
        ReferenceElement(path: Path<ReferenceElement>) {
          const element = path.node;
          if (element.hasKey('summary')) {
            annotations.push(annotation);
            element.remove('summary');
          }
        },
      },
    };
  };

export default referenceSummaryRefractorPlugin;
