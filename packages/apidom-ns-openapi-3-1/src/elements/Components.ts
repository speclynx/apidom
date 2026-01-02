import { ObjectElement } from '@speclynx/apidom-datamodel';
import { ComponentsElement } from '@speclynx/apidom-ns-openapi-3-0';

/**
 * @public
 */
class Components extends ComponentsElement {
  get pathItems(): ObjectElement | undefined {
    return this.get('pathItems') as ObjectElement | undefined;
  }

  set pathItems(pathItems: ObjectElement | undefined) {
    this.set('pathItems', pathItems);
  }
}

export default Components;
