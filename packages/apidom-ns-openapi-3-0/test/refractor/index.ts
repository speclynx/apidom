import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import sinon from 'sinon';
import { ObjectElement, Namespace } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import {
  refract,
  OpenApi3_0Element,
  OpenapiElement,
  isOpenapiElement,
  isOpenApi3_0Element,
} from '../../src/index.ts';
import * as predicates from '../../src/predicates.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('refractor', function () {
  context('given generic ApiDOM object in OpenApi 3.0.4 shape', function () {
    specify('should refract to OpenApi 3.0 Element', function () {
      const openApiString = fs
        .readFileSync(path.join(__dirname, 'fixtures', 'openapi.json'))
        .toString();
      const openApiPojo = JSON.parse(openApiString);
      const genericObjectElement = new ObjectElement(openApiPojo);
      const openApiElement = refract(genericObjectElement);

      expect(openApiElement).toMatchSnapshot();
    });
  });

  context('given semantic ApiDOM object', function () {
    specify('should refract to OpenApi 3.0', function () {
      class SemanticElement extends ObjectElement {
        constructor(content?: Record<string, unknown>) {
          super(content);
          this.element = 'custom';
        }
      }

      const semanticElement = new SemanticElement({ openapi: '3.0.4' });
      const openApi30Element = refract<OpenApi3_0Element>(semanticElement);

      assert.isTrue(isOpenApi3_0Element(openApi30Element));
    });
  });

  context('supports plugins', function () {
    let plugin1Spec: any;
    let plugin2Spec: any;
    let plugin1: any;
    let plugin2: any;

    beforeEach(function () {
      plugin1Spec = {
        name: 'plugin1',
        pre() {},
        visitor: {
          OpenapiElement(path: Path<OpenapiElement>) {
            // @ts-ignore
            path.node.content = '3.0.5';
          },
        },
        post() {},
      };
      plugin2Spec = {
        name: 'plugin2',
        pre() {},
        visitor: {
          OpenapiElement(path: Path<OpenapiElement>) {
            // @ts-ignore
            path.node.meta.set('metaKey', 'metaValue');
          },
        },
        post() {},
      };
      plugin1 = sinon.spy(() => plugin1Spec);
      plugin2 = sinon.spy(() => plugin2Spec);

      sinon.spy(plugin1Spec, 'pre');
      sinon.spy(plugin1Spec, 'post');
      sinon.spy(plugin1Spec.visitor, 'OpenapiElement');

      sinon.spy(plugin2Spec, 'pre');
      sinon.spy(plugin2Spec, 'post');
      sinon.spy(plugin2Spec.visitor, 'OpenapiElement');
    });

    context('plugin', function () {
      specify('should be called with toolbox object', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1],
        });

        assert.hasAllKeys(plugin1.firstCall.args[0], ['predicates', 'namespace']);
      });

      specify('should have predicates in toolbox object', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1],
        });

        assert.hasAnyKeys(plugin1.firstCall.args[0].predicates, Object.keys(predicates));
      });

      specify('should have namespace in toolbox object', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1],
        });

        assert.instanceOf(plugin1.firstCall.args[0].namespace, Namespace);
      });
    });

    context('pre hook', function () {
      specify('should call it once', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1],
        });

        assert.isTrue(plugin1Spec.pre.calledOnce);
      });

      specify('should call it before other plugin pre hook', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.pre.calledBefore(plugin2Spec.pre));
      });

      specify('should call it before visiting', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.pre.calledBefore(plugin1Spec.visitor.OpenapiElement));
        assert.isTrue(plugin1Spec.pre.calledBefore(plugin2Spec.visitor.OpenapiElement));
      });
    });

    context('post hook', function () {
      specify('should call it once', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1],
        });

        assert.isTrue(plugin1Spec.post.calledOnce);
      });

      specify('should call it before other plugin post hook', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.post.calledBefore(plugin2Spec.post));
      });

      specify('should call it after visiting', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.post.calledAfter(plugin1Spec.visitor.OpenapiElement));
        assert.isTrue(plugin1Spec.post.calledAfter(plugin2Spec.visitor.OpenapiElement));
      });
    });

    context('visitor', function () {
      specify('should be called once', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.visitor.OpenapiElement.calledOnce);
        assert.isTrue(plugin2Spec.visitor.OpenapiElement.calledOnce);
      });

      specify('should be called in proper order', function () {
        const genericObject = new ObjectElement({
          openapi: '3.0.4',
        });
        refract(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(
          plugin1Spec.visitor.OpenapiElement.calledBefore(plugin2Spec.visitor.OpenapiElement),
        );
      });

      context('first plugin', function () {
        specify('should receive arguments', function () {
          const genericObject = new ObjectElement({
            openapi: '3.0.4',
          });
          refract(genericObject, {
            plugins: [plugin1],
          });

          assert.lengthOf(plugin1Spec.visitor.OpenapiElement.firstCall.args, 1);
        });

        specify('should receive path as first argument', function () {
          const genericObject = new ObjectElement({
            openapi: '3.0.4',
          });
          refract(genericObject, {
            plugins: [plugin1],
          });

          const pathArg = plugin1Spec.visitor.OpenapiElement.firstCall.args[0];
          assert.isTrue(isOpenapiElement(pathArg.node));
        });

        specify('should augment openapi version', function () {
          const genericObject = new ObjectElement({
            openapi: '3.0.4',
          });
          const openApiElement = refract(genericObject, {
            plugins: [plugin1],
          });

          assert.deepEqual(toValue(openApiElement), { openapi: '3.0.5' });
        });
      });

      context('second plugin', function () {
        specify('should receive arguments', function () {
          const genericObject = new ObjectElement({
            openapi: '3.0.4',
          });
          refract(genericObject, {
            plugins: [plugin1, plugin2],
          });

          assert.lengthOf(plugin2Spec.visitor.OpenapiElement.firstCall.args, 1);
        });

        specify('should receive path as first argument', function () {
          const genericObject = new ObjectElement({
            openapi: '3.0.4',
          });
          refract(genericObject, {
            plugins: [plugin1, plugin2],
          });

          const pathArg = plugin2Spec.visitor.OpenapiElement.firstCall.args[0];
          assert.isTrue(isOpenapiElement(pathArg.node));
        });

        specify('should append metadata to openapi version', function () {
          const genericObject = new ObjectElement({
            openapi: '3.0.4',
          });
          const openApiElement = refract(genericObject, {
            plugins: [plugin1, plugin2],
          });

          // @ts-ignore
          assert.strictEqual(toValue(openApiElement.openapi.meta.get('metaKey')), 'metaValue');
        });
      });
    });
  });
});
