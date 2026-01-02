import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';
import { refractJSONReference } from '@speclynx/apidom-ns-json-schema-draft-4';

describe('refractor', function () {
  context('elements', function () {
    context('JSONReference', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const jsonReferenceElement = refractJSONReference({
          $ref: 'https://example.com/#/json/pointer',
        });

        expect(sexprs(jsonReferenceElement)).toMatchSnapshot();
      });
    });
  });
});
