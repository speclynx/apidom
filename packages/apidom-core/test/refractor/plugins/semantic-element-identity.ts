import { assert } from 'chai';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import {
  dispatchRefractorPlugins,
  refractorPluginSemanticElementIdentity,
} from '../../../src/index.ts';

// Ad-hoc semantic element classes for testing
class ContactElement extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'contact';
  }
}

class InfoElement extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'info';
  }
}

describe('refractor', function () {
  context('plugins', function () {
    context('semantic-element-identity', function () {
      specify('should not add unique ID to primitive elements in ApiDOM tree', function () {
        const contactElement = new ContactElement({ name: 'John Doe' });
        const infoElement = new InfoElement({
          title: 'title',
          summary: 'summary',
          contact: contactElement,
        });
        const objectElement = new ObjectElement({ a: 'b', info: infoElement });
        const result = dispatchRefractorPlugins(objectElement, [
          refractorPluginSemanticElementIdentity(),
        ]) as ObjectElement;

        // Primitive elements should NOT have IDs
        assert.lengthOf(result.id, 0);
        assert.lengthOf(result.getMember('a')!.key!.id, 0);
        assert.lengthOf(result.getMember('a')!.value!.id, 0);
        assert.lengthOf(result.getMember('info')!.key!.id, 0);
      });

      specify('should add unique ID to semantic elements in ApiDOM tree', function () {
        const contactElement = new ContactElement({ name: 'John Doe' });
        const infoElement = new InfoElement({
          title: 'title',
          summary: 'summary',
          contact: contactElement,
        });
        const objectElement = new ObjectElement({ a: 'b', info: infoElement });
        const result = dispatchRefractorPlugins(objectElement, [
          refractorPluginSemanticElementIdentity(),
        ]) as ObjectElement;
        const defaultLength = 6;

        // Semantic elements (InfoElement, ContactElement) should have IDs
        assert.lengthOf(result.getMember('info')!.value!.id, defaultLength);
        assert.lengthOf(
          (result.getMember('info')!.value as ObjectElement).get('contact')!.id,
          defaultLength,
        );
      });

      specify(
        'should add unique ID of specific length to semantic elements in ApiDOM tree',
        function () {
          const length = 3;
          const contactElement = new ContactElement({ name: 'John Doe' });
          const infoElement = new InfoElement({
            title: 'title',
            summary: 'summary',
            contact: contactElement,
          });
          const objectElement = new ObjectElement({ a: 'b', info: infoElement });
          const result = dispatchRefractorPlugins(objectElement, [
            refractorPluginSemanticElementIdentity({ length }),
          ]) as ObjectElement;

          assert.lengthOf(result.getMember('info')!.value!.id, length);
          assert.lengthOf(
            (result.getMember('info')!.value as ObjectElement).get('contact')!.id,
            length,
          );
        },
      );

      specify('should not add unique ID when already present', function () {
        const infoElement = new InfoElement({
          title: 'title',
          summary: 'summary',
        });
        infoElement.id = 'unique-id';
        const newInfoElement = dispatchRefractorPlugins(infoElement, [
          refractorPluginSemanticElementIdentity(),
        ]);

        assert.strictEqual(newInfoElement.id, 'unique-id');
      });
    });
  });
});
