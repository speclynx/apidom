import { OpenapiElement } from '@speclynx/apidom-ns-openapi-3-1';

const openAPIVersionRefractorPlugin = () => () => ({
  visitor: {
    OpenapiElement(element: OpenapiElement) {
      (element.content as unknown as string) = '3.0.3';
    },
  },
});

export default openAPIVersionRefractorPlugin;
