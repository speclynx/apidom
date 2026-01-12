import { OpenapiElement } from '@speclynx/apidom-ns-openapi-3-1';
import { type Path } from '@speclynx/apidom-traverse';

const openAPIVersionRefractorPlugin = () => () => ({
  visitor: {
    OpenapiElement(path: Path<OpenapiElement>) {
      const element = path.node;
      (element.content as unknown as string) = '3.0.3';
    },
  },
});

export default openAPIVersionRefractorPlugin;
