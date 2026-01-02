import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMessageTrait } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MessageTraitElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageTraitElement = refractMessageTrait({
          messageId: 'unique-id',
          schemaFormat: 'application/schema+json;version=draft-07',
          contentType: 'application/json',
          name: 'message-trait-name',
          title: 'message-trait-title',
          summary: 'message-trait-summary',
          description: 'message-trait-description',
          tags: [],
          externalDocs: {},
          examples: [{ a: 1 }],
        });

        expect(sexprs(messageTraitElement)).toMatchSnapshot();
      });
    });

    context('given headers field of type SchemaElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageTraitElement = refractMessageTrait({
          headers: {},
        });

        expect(sexprs(messageTraitElement)).toMatchSnapshot();
      });
    });

    context('given headers field of type ReferenceElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageTraitElement = refractMessageTrait({
          headers: {
            $ref: '#/path/to/schema',
          },
        });

        expect(sexprs(messageTraitElement)).toMatchSnapshot();
      });
    });

    context('given correlationId field of type CorrelationIDElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageTraitElement = refractMessageTrait({
          correlationId: {},
        });

        expect(sexprs(messageTraitElement)).toMatchSnapshot();
      });
    });

    context('given correlationId field of type ReferenceElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageTraitElement = refractMessageTrait({
          correlationId: {
            $ref: '#/path/to/correlationID',
          },
        });

        expect(sexprs(messageTraitElement)).toMatchSnapshot();
      });
    });

    context('given bindings field of type MessageBindingsElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageTraitElement = refractMessageTrait({
          bindings: {},
        });

        expect(sexprs(messageTraitElement)).toMatchSnapshot();
      });
    });

    context('given bindings field of type ReferenceElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageTraitElement = refractMessageTrait({
          bindings: {
            $ref: '#/path/to/message-bindings',
          },
        });

        expect(sexprs(messageTraitElement)).toMatchSnapshot();
      });
    });
  });
});
