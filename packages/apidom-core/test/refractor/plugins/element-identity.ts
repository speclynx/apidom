import { assert } from 'chai';
import { ObjectElement, StringElement } from '@speclynx/apidom-datamodel';

import {
  refractorPluginElementIdentity,
  dispatchRefractorPlugins,
  toValue,
} from '../../../src/index.ts';

describe('refractor', function () {
  context('plugins', function () {
    context('element-identity', function () {
      specify('should add unique ID to all elements in ApiDOM tree', function () {
        const objectElement = new ObjectElement({ a: 'b' });
        const result = dispatchRefractorPlugins(objectElement, [
          refractorPluginElementIdentity(),
        ]) as ObjectElement;
        const defaultLength = 6;

        assert.lengthOf(toValue(result.id) as string, defaultLength);
        assert.lengthOf(toValue(result.getMember('a')!.key!.id) as string, defaultLength);
        assert.lengthOf(toValue(result.getMember('a')!.value!.id) as string, defaultLength);
      });

      specify(
        'should add unique ID of specific length to all elements in ApiDOM tree',
        function () {
          const length = 3;
          const objectElement = new ObjectElement({ a: 'b' });
          const result = dispatchRefractorPlugins(objectElement, [
            refractorPluginElementIdentity({ length }),
          ]) as ObjectElement;

          assert.lengthOf(toValue(result.id) as string, length);
          assert.lengthOf(toValue(result.getMember('a')!.key!.id) as string, length);
          assert.lengthOf(toValue(result.getMember('a')!.value!.id) as string, length);
        },
      );

      specify('should not add unique ID when already present', function () {
        const objectElement = new ObjectElement({ id: '123' });
        objectElement.id = new StringElement('unique-id');
        const newObjectElement = dispatchRefractorPlugins(objectElement, [
          refractorPluginElementIdentity(),
        ]);

        assert.isTrue(newObjectElement.id.equals('unique-id'));
      });
    });
  });
});
