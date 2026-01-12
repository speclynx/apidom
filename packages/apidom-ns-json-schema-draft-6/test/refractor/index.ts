import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import sinon from 'sinon';
import { ObjectElement, Namespace } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import { refractJSONSchema, MediaElement, isMediaElement } from '../../src/index.ts';
import * as predicates from '../../src/predicates.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('refractor', function () {
  context('given generic ApiDOM object in JSON Schema Draft 6 shape', function () {
    specify('should refract to JSONSchema Element', function () {
      const jsonSchemaString = fs
        .readFileSync(path.join(__dirname, 'fixtures', 'json-schema-draft6.json'))
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
          MediaElement(pathArg: Path<MediaElement>) {
            // @ts-ignore
            pathArg.node.binaryEncoding = 'base64';
          },
        },
        post() {},
      };
      plugin2Spec = {
        name: 'plugin2',
        pre() {},
        visitor: {
          MediaElement(pathArg: Path<MediaElement>) {
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
      sinon.spy(plugin1Spec.visitor, 'MediaElement');

      sinon.spy(plugin2Spec, 'pre');
      sinon.spy(plugin2Spec, 'post');
      sinon.spy(plugin2Spec.visitor, 'MediaElement');
    });

    context('plugin', function () {
      specify('should be called with toolbox object', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.hasAllKeys(plugin1.firstCall.args[0], ['predicates', 'namespace']);
      });

      specify('should have predicates in toolbox object', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.hasAnyKeys(plugin1.firstCall.args[0].predicates, Object.keys(predicates));
      });

      specify('should have namespace in toolbox object', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
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
          $schema: 'http://json-schema.org/draft-06/schema#',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.isTrue(plugin1Spec.pre.calledOnce);
      });

      specify('should call it before other plugin pre hook', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.pre.calledBefore(plugin2Spec.pre));
      });

      specify('should call it before visiting', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
          media: {},
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.pre.calledBefore(plugin1Spec.visitor.MediaElement));
        assert.isTrue(plugin1Spec.pre.calledBefore(plugin2Spec.visitor.MediaElement));
      });
    });

    context('post hook', function () {
      specify('should call it once', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1],
        });

        assert.isTrue(plugin1Spec.post.calledOnce);
      });

      specify('should call it before other plugin post hook', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.post.calledBefore(plugin2Spec.post));
      });

      specify('should call it after visiting', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
          media: {},
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.post.calledAfter(plugin1Spec.visitor.MediaElement));
        assert.isTrue(plugin1Spec.post.calledAfter(plugin2Spec.visitor.MediaElement));
      });
    });

    context('visitor', function () {
      specify('should be called once', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
          media: {},
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(plugin1Spec.visitor.MediaElement.calledOnce);
        assert.isTrue(plugin2Spec.visitor.MediaElement.calledOnce);
      });

      specify('should be called in proper order', function () {
        const genericObject = new ObjectElement({
          $id: 'http://x.y.z/rootschema.json#',
          $schema: 'http://json-schema.org/draft-06/schema#',
          media: {},
        });
        refractJSONSchema(genericObject, {
          plugins: [plugin1, plugin2],
        });

        assert.isTrue(
          plugin1Spec.visitor.MediaElement.calledBefore(plugin2Spec.visitor.MediaElement),
        );
      });

      context('first plugin', function () {
        specify('should receive arguments', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'http://json-schema.org/draft-06/schema#',
            media: {},
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1],
          });

          assert.lengthOf(plugin1Spec.visitor.MediaElement.firstCall.args, 1);
        });

        specify('should receive path as first argument with node property', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'http://json-schema.org/draft-06/schema#',
            media: {},
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1],
          });

          const pathArg = plugin1Spec.visitor.MediaElement.firstCall.args[0];
          assert.instanceOf(pathArg, Path);
          assert.isTrue(isMediaElement(pathArg.node));
        });

        specify('should augment MediaElement.binaryEncoding field', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'http://json-schema.org/draft-06/schema#',
            media: {},
          });
          const jsonSchemaElement = refractJSONSchema(genericObject, {
            plugins: [plugin1],
          });

          assert.deepEqual(toValue(jsonSchemaElement), {
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'http://json-schema.org/draft-06/schema#',
            media: { binaryEncoding: 'base64' },
          });
        });
      });

      context('second plugin', function () {
        specify('should receive arguments', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'http://json-schema.org/draft-06/schema#',
            media: {},
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1, plugin2],
          });

          assert.lengthOf(plugin2Spec.visitor.MediaElement.firstCall.args, 1);
        });

        specify('should receive path as first argument with node property', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'http://json-schema.org/draft-06/schema#',
            media: {},
          });
          refractJSONSchema(genericObject, {
            plugins: [plugin1, plugin2],
          });

          const pathArg = plugin2Spec.visitor.MediaElement.firstCall.args[0];
          assert.instanceOf(pathArg, Path);
          assert.isTrue(isMediaElement(pathArg.node));
        });

        specify('should append metadata to MediaElement', function () {
          const genericObject = new ObjectElement({
            $id: 'http://x.y.z/rootschema.json#',
            $schema: 'http://json-schema.org/draft-06/schema#',
            media: {},
          });
          const jsonSchemaElement = refractJSONSchema(genericObject, {
            plugins: [plugin1, plugin2],
          });

          // @ts-ignore
          assert.strictEqual(toValue(jsonSchemaElement.media.meta.get('metaKey')), 'metaValue');
        });
      });
    });
  });
});
