import { assert } from 'chai';
import { ObjectElement, Namespace } from '@speclynx/apidom-datamodel';

import * as apiDOM from '../src/index.ts';

// Ad-hoc semantic element classes for testing
class InfoElement extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'info';
  }
}

class OpenApi3_1Element extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'openApi3_1';
  }
}

describe('apidom', function () {
  context('dehydrate', function () {
    specify('should dehydrate generic ObjectElement', function () {
      const objectElement = new ObjectElement({ a: 1, b: 'test' });
      const namespace = new Namespace();

      const result = apiDOM.dehydrate(objectElement, namespace);

      assert.isDefined(result);
      assert.isObject(result);
    });

    specify('should dehydrate semantic elements', function () {
      const infoElement = new InfoElement({
        title: 'Sample API',
        version: '1.0.0',
      });
      const openApiElement = new OpenApi3_1Element({
        openapi: '3.1.0',
        info: infoElement,
      });
      const namespace = new Namespace();

      const result = apiDOM.dehydrate(openApiElement, namespace);

      assert.isDefined(result);
      assert.isObject(result);
    });

    specify('should use default namespace when not provided', function () {
      const objectElement = new ObjectElement({ key: 'value' });

      const result = apiDOM.dehydrate(objectElement);

      assert.isDefined(result);
      assert.isObject(result);
    });
  });
});
