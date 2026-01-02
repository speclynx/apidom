import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Response extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'response';
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get headers(): ObjectElement | undefined {
    return this.get('headers') as ObjectElement | undefined;
  }

  set headers(headers: ObjectElement | undefined) {
    this.set('headers', headers);
  }

  get contentField(): ObjectElement | undefined {
    return this.get('content') as ObjectElement | undefined;
  }

  set contentField(content: ObjectElement | undefined) {
    this.set('content', content);
  }

  get linksField(): ObjectElement | undefined {
    return this.get('links') as ObjectElement | undefined;
  }

  set linksField(links: ObjectElement | undefined) {
    this.set('links', links);
  }
}

export default Response;
