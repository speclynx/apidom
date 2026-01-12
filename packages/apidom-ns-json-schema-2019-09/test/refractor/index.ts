import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import sinon from 'sinon';
import { ObjectElement, Namespace } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import {
  LinkDescriptionElement,
  isLinkDescriptionElement,
  refractJSONSchema,
} from '../../src/index.ts';
import * as predicates from '../../src/predicates.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('refractor', function () {
  context('given generic ApiDOM object in JSON Schema 2019-09 shape', function () {
    specify('should refract to JSONSchema Element', function () {
      const jsonSchemaString = fs
        .readFileSync(path.join(__dirname, 'fixtures', 'json-schema-2019-09.json'))
        .toString();
      const jsonSchemaPojo = JSON.parse(jsonSchemaString);
      const genericObjectElement = new ObjectElement(jsonSchemaPojo);
      const jsonSchemaElement = refractJSONSchema(genericObjectElement);

      expect(jsonSchemaElement).toMatchSnapshot();
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
          LinkDescriptionElement(pathArg: Path<LinkDescriptionElement>) {
            // @ts-ignore
            pathArg.node.anchor = 'nodes/{thisNodeId}';
          },
        },
        post() {},
      };
      plugin2Spec = {
        name: 'plugin2',
        pre() {},
        visitor: {
          LinkDescriptionElement(pathArg: Path<LinkDescriptionElement>) {
            // @ts-ignore
            pathArg.node.meta.set('metaKey', 'metaValue');
          },
        },
        post() {},
      };
      plugin1 = sinon.spy(() => plugin1Spec);
      plugin2 = sinon.spy(() => plugin2Spec);

      sinon.spy(plugin1Spec, 'pre');
      sinon.spy(plugin1Spec, 'post');
      sinon.spy(plugin1Spec.visitor, 'LinkDescriptionElement');

      sinon.spy(plugin2Spec, 'pre');
      sinon.spy(plugin2Spec, 'post');
      sinon.spy(plugin2Spec.visitor, 'LinkDescriptionElement');
    });

    context('plugin', function () {
      specify('should be called with toolbox object', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.hasAllKeys(plugin1.firstCall.args[0], ['predicates', 'namespace']);
      });

      specify('should have predicates in toolbox object', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.hasAnyKeys(plugin1.firstCall.args[0].predicates, Object.keys(predicates));
      });

      specify('should have namespace in toolbox object', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.instanceOf(plugin1.firstCall.args[0].namespace, Namespace);
      });
    });

    context('pre hook', function () {
      specify('should call it once', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.isTrue(plugin1Spec.pre.calledOnce);
      });

      specify('should call it before other plugin pre hook', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.pre.calledBefore(plugin2Spec.pre));
      });

      specify('should call it before visiting', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
          links: [{}],
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.pre.calledBefore(plugin1Spec.visitor.LinkDescriptionElement));
        assert.isTrue(plugin1Spec.pre.calledBefore(plugin2Spec.visitor.LinkDescriptionElement));
      });
    });

    context('post hook', function () {
      specify('should call it once', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.isTrue(plugin1Spec.post.calledOnce);
      });

      specify('should call it before other plugin post hook', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.post.calledBefore(plugin2Spec.post));
      });

      specify('should call it after visiting', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
          links: [{}],
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.post.calledAfter(plugin1Spec.visitor.LinkDescriptionElement));
        assert.isTrue(plugin1Spec.post.calledAfter(plugin2Spec.visitor.LinkDescriptionElement));
      });
    });

    context('visitor', function () {
      specify('should be called once', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
          links: [{}],
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.visitor.LinkDescriptionElement.calledOnce);
        assert.isTrue(plugin2Spec.visitor.LinkDescriptionElement.calledOnce);
      });

      specify('should be called in proper order', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'https://json-schema.org/draft/2019-09/schema',
          links: [{}],
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(
          plugin1Spec.visitor.LinkDescriptionElement.calledBefore(
            plugin2Spec.visitor.LinkDescriptionElement,
          ),
        );
      });

      context('first plugin', function () {
        specify('should receive arguments', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            links: [{}],
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1],
          });

          assert.lengthOf(plugin1Spec.visitor.LinkDescriptionElement.firstCall.args, 1);
        });

        specify('should receive path as first argument with node property', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            links: [{}],
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1],
          });

          const pathArg = plugin1Spec.visitor.LinkDescriptionElement.firstCall.args[0];
          assert.instanceOf(pathArg, Path);
          assert.isTrue(isLinkDescriptionElement(pathArg.node));
        });

        specify('should augment LinkDescriptionElement.anchor field', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            links: [{}],
          });
          const jsonSchemaElement = refractJSONSchema(genericObject, {
            plugins: [plugin1],
          });

          assert.deepEqual(toValue(jsonSchemaElement), {
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            links: [{ anchor: 'nodes/{thisNodeId}' }],
          });
        });
      });

      context('second plugin', function () {
        specify('should receive arguments', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            links: [{}],
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1, plugin2],
          });

          assert.lengthOf(plugin2Spec.visitor.LinkDescriptionElement.firstCall.args, 1);
        });

        specify('should receive path as first argument with node property', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            links: [{}],
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1, plugin2],
          });

          const pathArg = plugin2Spec.visitor.LinkDescriptionElement.firstCall.args[0];
          assert.instanceOf(pathArg, Path);
          assert.isTrue(isLinkDescriptionElement(pathArg.node));
        });

        specify('should append metadata to LinkDescriptionElement', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            links: [{ href: 'test' }],
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1, plugin2],
          });

          // Verify the plugin was called and modified the element
          const pathArg = plugin2Spec.visitor.LinkDescriptionElement.firstCall.args[0];
          assert.strictEqual(toValue(pathArg.node.meta.get('metaKey')), 'metaValue');
        });
      });
    });
  });
});
