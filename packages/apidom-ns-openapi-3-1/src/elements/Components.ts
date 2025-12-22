import { ObjectElement } from '@speclynx/apidom-core';
import { ComponentsElement } from '@speclynx/apidom-ns-openapi-3-0';

/**
 * @public
 */
class Components extends ComponentsElement {
  get pathItems(): ObjectElement | undefined {
    return this.get('pathItems');
  }

  set pathItems(pathItems: ObjectElement | undefined) {
    this.set('pathItems', pathItems);
  }
}

export default Components;
