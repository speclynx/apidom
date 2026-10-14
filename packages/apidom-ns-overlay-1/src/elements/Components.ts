import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

import ComponentsActions from './nces/ComponentsActions.ts';

/**
 * @public
 */
class Components extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'components';
  }

  get actions(): ComponentsActions | undefined {
    return this.get('actions') as ComponentsActions | undefined;
  }

  set actions(actions: ComponentsActions | undefined) {
    this.set('actions', actions);
  }
}

export default Components;
