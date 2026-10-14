import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import OverlayElement from './Overlay.ts';
import InfoElement from './Info.ts';
import ComponentsElement from './Components.ts';
import Actions from './nces/Actions.ts';

/**
 * @public
 */
class Overlay1 extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'overlay1';
    this.classes.push('api');
  }

  get overlay(): OverlayElement | undefined {
    return this.get('overlay') as OverlayElement | undefined;
  }

  set overlay(overlay: OverlayElement | undefined) {
    this.set('overlay', overlay);
  }

  get $self(): StringElement | undefined {
    return this.get('$self') as StringElement | undefined;
  }

  set $self($self: StringElement | undefined) {
    this.set('$self', $self);
  }

  get info(): InfoElement | undefined {
    return this.get('info') as InfoElement | undefined;
  }

  set info(info: InfoElement | undefined) {
    this.set('info', info);
  }

  get extends(): StringElement | undefined {
    return this.get('extends') as StringElement | undefined;
  }

  set extends(extendsVal: StringElement | undefined) {
    this.set('extends', extendsVal);
  }

  get actions(): Actions | undefined {
    return this.get('actions') as Actions | undefined;
  }

  set actions(actions: Actions | undefined) {
    this.set('actions', actions);
  }

  get components(): ComponentsElement | undefined {
    return this.get('components') as ComponentsElement | undefined;
  }

  set components(components: ComponentsElement | undefined) {
    this.set('components', components);
  }
}

export default Overlay1;
