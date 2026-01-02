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
class Encoding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'encoding';
  }

  get contentType(): StringElement | undefined {
    return this.get('contentType') as StringElement | undefined;
  }

  set contentType(contentType: StringElement | undefined) {
    this.set('contentType', contentType);
  }

  get headers(): ObjectElement | undefined {
    return this.get('headers') as ObjectElement | undefined;
  }

  set headers(headers: ObjectElement | undefined) {
    this.set('headers', headers);
  }

  get style(): StringElement | undefined {
    return this.get('style') as StringElement | undefined;
  }

  set style(style: StringElement | undefined) {
    this.set('style', style);
  }

  get explode(): BooleanElement | undefined {
    return this.get('explode') as BooleanElement | undefined;
  }

  set explode(explode: BooleanElement | undefined) {
    this.set('explode', explode);
  }

  get allowedReserved(): BooleanElement | undefined {
    return this.get('allowedReserved') as BooleanElement | undefined;
  }

  set allowedReserved(allowedReserved: BooleanElement | undefined) {
    this.set('allowedReserved', allowedReserved);
  }
}

export default Encoding;
