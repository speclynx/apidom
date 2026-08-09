import { assert } from 'chai';
import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import {
  refractOpenApi3_1,
  refractorPluginNormalizeParameters,
  OpenApi3_1Element,
  OperationElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('normalize-parameters', function () {
      context(
        'given Operation parameters carrying meta, attributes, source map and style',
        function () {
          specify('should preserve them on the merged parameters container', function () {
            const parameters = new ArrayElement([{ name: 'param2', in: 'query' }]);
            parameters.style = { yaml: { styleGroup: 'Flow' } };
            parameters.meta.set('custom-meta', 'meta-value');
            parameters.attributes.set('custom-attribute', 'attribute-value');
            parameters.startLine = 1;
            parameters.startCharacter = 2;
            parameters.startOffset = 3;
            parameters.endLine = 4;
            parameters.endCharacter = 5;
            parameters.endOffset = 6;

            const operation = new ObjectElement();
            operation.set('parameters', parameters);
            const pathItem = new ObjectElement({
              parameters: [{ name: 'param1', in: 'query' }],
            });
            pathItem.set('get', operation);
            const paths = new ObjectElement();
            paths.set('/', pathItem);
            const definition = new ObjectElement({ openapi: '3.1.0' });
            definition.set('paths', paths);

            const openApiElement = refractOpenApi3_1(definition, {
              plugins: [refractorPluginNormalizeParameters()],
            }) as OpenApi3_1Element;

            const pathItemElement = openApiElement.paths?.get('/') as ObjectElement;
            const operationElement = pathItemElement.get('get') as OperationElement;
            const mergedParameters = operationElement.parameters as ArrayElement;

            assert.strictEqual(mergedParameters.length, 2);
            assert.deepEqual(mergedParameters.style, { yaml: { styleGroup: 'Flow' } });
            assert.strictEqual(mergedParameters.meta.get('custom-meta'), 'meta-value');
            assert.strictEqual(
              toValue(mergedParameters.attributes.get('custom-attribute')),
              'attribute-value',
            );
            assert.strictEqual(mergedParameters.startLine, 1);
            assert.strictEqual(mergedParameters.startCharacter, 2);
            assert.strictEqual(mergedParameters.startOffset, 3);
            assert.strictEqual(mergedParameters.endLine, 4);
            assert.strictEqual(mergedParameters.endCharacter, 5);
            assert.strictEqual(mergedParameters.endOffset, 6);
          });
        },
      );
    });
  });
});
