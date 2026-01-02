import {
  ObjectElement,
  StringElement,
  BooleanElement,
  Element,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import SchemaElement from './Schema.ts';
import ReferenceElement from './Reference.ts';

/**
 * @public
 */
class Header extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'header';
  }

  get required(): BooleanElement {
    if (this.hasKey('required')) {
      return this.get('required') as BooleanElement;
    }
    return new BooleanElement(false);
  }

  set required(required: BooleanElement | undefined) {
    this.set('required', required);
  }

  get deprecated(): BooleanElement | undefined {
    if (this.hasKey('deprecated')) {
      return this.get('deprecated') as BooleanElement;
    }
    return new BooleanElement(false);
  }

  set deprecated(deprecated: BooleanElement | undefined) {
    this.set('deprecated', deprecated);
  }

  get allowEmptyValue(): BooleanElement | undefined {
    return this.get('allowEmptyValue') as BooleanElement | undefined;
  }

  set allowEmptyValue(allowEmptyValue: BooleanElement | undefined) {
    this.set('allowEmptyValue', allowEmptyValue);
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

  get allowReserved(): BooleanElement | undefined {
    return this.get('allowReserved') as BooleanElement | undefined;
  }

  set allowReserved(allowReserved: BooleanElement | undefined) {
    this.set('allowReserved', allowReserved);
  }

  get schema(): SchemaElement | ReferenceElement | undefined {
    return this.get('schema') as SchemaElement | ReferenceElement | undefined;
  }

  set schema(schema: SchemaElement | ReferenceElement | undefined) {
    this.set('schema', schema);
  }

  get example(): Element | undefined {
    return this.get('example') as Element | undefined;
  }

  set example(example: Element | undefined) {
    this.set('example', example);
  }

  get examples(): ObjectElement | undefined {
    return this.get('examples') as ObjectElement | undefined;
  }

  set examples(examples: ObjectElement | undefined) {
    this.set('examples', examples);
  }

  get contentField(): ObjectElement | undefined {
    return this.get('content') as ObjectElement | undefined;
  }

  set contentField(content: ObjectElement | undefined) {
    this.set('content', content);
  }
}

Object.defineProperty(Header.prototype, 'description', {
  get(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  },
  set(description: StringElement | undefined) {
    this.set('description', description);
  },
  enumerable: true,
});

export default Header;
