import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractJsonSchemaDialect } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('JsonSchemaDialectElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const jsonSchemaDialectElement = refractJsonSchemaDialect(
          'https://spec.openapis.org/oas/3.1/dialect/base',
        );

        expect(sexprs(jsonSchemaDialectElement)).toMatchSnapshot();
      });
    });
  });
});
