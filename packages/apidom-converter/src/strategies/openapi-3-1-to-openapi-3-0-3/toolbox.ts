import {
  Element,
  Meta,
  Attributes,
  AnnotationElement,
  SourceMapElement,
} from '@speclynx/apidom-datamodel';
import { createToolbox as createToolboxOpenAPI31 } from '@speclynx/apidom-ns-openapi-3-1';

const createToolbox = () => {
  const openAPI31Toolbox = createToolboxOpenAPI31();

  const createAnnotation = (content?: string, meta?: Meta, attributes?: Attributes) => {
    return new AnnotationElement(content, meta, attributes);
  };
  createAnnotation.fromElement = <T extends Element>(
    element: T,
    content?: string,
    meta?: Meta,
    attributes?: Attributes,
  ) => {
    const annotation = createAnnotation(content, meta, attributes);
    SourceMapElement.transfer(element, annotation);
    return annotation;
  };

  return {
    ...openAPI31Toolbox,
    copySourceMap: SourceMapElement.transfer,
    createAnnotation,
  };
};

export type Toolbox = ReturnType<typeof createToolbox>;

export default createToolbox;
