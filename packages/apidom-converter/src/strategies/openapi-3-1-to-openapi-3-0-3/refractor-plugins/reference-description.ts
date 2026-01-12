import { ReferenceElement } from '@speclynx/apidom-ns-openapi-3-1';
import { AnnotationElement } from '@speclynx/apidom-datamodel';
import { type Path } from '@speclynx/apidom-traverse';

type ReferenceDescriptionPluginOptions = {
  annotations: AnnotationElement[];
};

const referenceDescriptionRefractorPlugin =
  ({ annotations }: ReferenceDescriptionPluginOptions) =>
  () => {
    const annotation = new AnnotationElement(
      'The "description" field of Reference Object is not supported in OpenAPI 3.0.3. It has been removed from the converted document.',
      { classes: ['warning'] },
      { code: 'reference-description' },
    );

    return {
      visitor: {
        ReferenceElement(path: Path<ReferenceElement>) {
          const element = path.node;
          if (element.hasKey('description')) {
            annotations.push(annotation);
            element.remove('description');
          }
        },
      },
    };
  };

export default referenceDescriptionRefractorPlugin;
