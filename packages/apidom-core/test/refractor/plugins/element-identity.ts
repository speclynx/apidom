import { assert } from 'chai';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { refractorPluginElementIdentity, dispatchRefractorPlugins } from '../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('element-identity', function () {
      specify('should add unique ID to all elements in ApiDOM tree', function () {
        const objectElement = new ObjectElement({ a: 'b' });
        const result = dispatchRefractorPlugins(objectElement, [
          refractorPluginElementIdentity(),
        ]) as ObjectElement;
        const defaultLength = 6;

        assert.lengthOf(result.id, defaultLength);
        assert.lengthOf(result.getMember('a')!.key!.id, defaultLength);
        assert.lengthOf(result.getMember('a')!.value!.id, defaultLength);
      });

      specify(
        'should add unique ID of specific length to all elements in ApiDOM tree',
        function () {
          const length = 3;
          const objectElement = new ObjectElement({ a: 'b' });
          const result = dispatchRefractorPlugins(objectElement, [
            refractorPluginElementIdentity({ length }),
          ]) as ObjectElement;

          assert.lengthOf(result.id, length);
          assert.lengthOf(result.getMember('a')!.key!.id, length);
          assert.lengthOf(result.getMember('a')!.value!.id, length);
        },
      );

      specify('should not add unique ID when already present', function () {
        const objectElement = new ObjectElement({ id: '123' });
        objectElement.id = 'unique-id';
        const newObjectElement = dispatchRefractorPlugins(objectElement, [
          refractorPluginElementIdentity(),
        ]);

        assert.strictEqual(newObjectElement.id, 'unique-id');
      });
    });
  });
});
