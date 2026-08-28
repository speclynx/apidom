import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractParameter, isSelectorElement, ParameterElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ParameterElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const parameterElement = refractParameter({
          name: 'userId',
          in: 'header',
          value: '{$inputs.userId}',
        });

        expect(sexprs(parameterElement)).toMatchSnapshot();
      });

      context('given value field of Selector Object shape', function () {
        specify('should refract to SelectorElement', function () {
          const parameterElement = refractParameter<ParameterElement>({
            name: 'userId',
            in: 'header',
            value: {
              context: '$response.body',
              selector: '$.user.id',
              type: 'jsonpath',
            },
          });

          assert.isTrue(isSelectorElement(parameterElement.value));
          expect(sexprs(parameterElement)).toMatchSnapshot();
        });
      });

      context('given value field of arbitrary object shape', function () {
        specify('should refract to ObjectElement', function () {
          const parameterElement = refractParameter<ParameterElement>({
            name: 'filter',
            in: 'querystring',
            value: { context: '$response.body', selector: '$.user.id' },
          });

          assert.isFalse(isSelectorElement(parameterElement.value));
          expect(sexprs(parameterElement)).toMatchSnapshot();
        });
      });
    });
  });
});
