import {
  StringElement,
  ObjectElement,
  BooleanElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class RequestBody extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'requestBody';
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get contentField(): ObjectElement | undefined {
    return this.get('content') as ObjectElement | undefined;
  }

  set contentField(content: ObjectElement | undefined) {
    this.set('content', content);
  }

  get required(): BooleanElement {
    if (this.hasKey('required')) {
      return this.get('required') as BooleanElement;
    }
    return new BooleanElement(false);
  }

  set required(required: BooleanElement) {
    this.set('required', required);
  }
}

export default RequestBody;
