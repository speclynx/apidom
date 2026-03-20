import {
  StringElement,
  BooleanElement,
  Element,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Action extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'action';
    this.classes.push('action');
  }

  get target(): StringElement | undefined {
    return this.get('target') as StringElement | undefined;
  }

  set target(target: StringElement | undefined) {
    this.set('target', target);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get update(): Element | undefined {
    return this.get('update') as Element | undefined;
  }

  set update(update: Element | undefined) {
    this.set('update', update);
  }

  get copy(): StringElement | undefined {
    return this.get('copy') as StringElement | undefined;
  }

  set copy(copy: StringElement | undefined) {
    this.set('copy', copy);
  }

  get removeField(): BooleanElement | undefined {
    return this.get('remove') as BooleanElement | undefined;
  }

  set removeField(remove: BooleanElement | undefined) {
    this.set('remove', remove);
  }
}

export default Action;
