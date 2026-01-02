import KeyValuePair from '../KeyValuePair.ts';
import Element, { type Meta, type Attributes } from './Element.ts';

/**
 * MemberElement represents a key-value pair member in an ObjectElement.
 *
 * The member's content is always a KeyValuePair containing:
 * - `key`: The key element (typically a StringElement)
 * - `value`: The value element (any Element type)
 *
 * @typeParam K - The key element type, defaults to Element
 * @typeParam V - The value element type, defaults to Element
 * @public
 */
class MemberElement<K extends Element = Element, V extends Element = Element> extends Element {
  declare protected _content: KeyValuePair;

  constructor(key?: unknown, value?: unknown, meta?: Meta, attributes?: Attributes) {
    super(new KeyValuePair(), meta, attributes);
    this.element = 'member';

    if (key !== undefined) {
      this.key = key;
    }

    // Note: We check arguments.length to distinguish between:
    // - new MemberElement('key') - value not provided, don't set
    // - new MemberElement('key', undefined) - value explicitly undefined, set it
    if (arguments.length >= 2) {
      this.value = value;
    }
  }

  primitive(): string {
    return 'member';
  }

  /**
   * The key element of this member.
   */
  get key(): K | undefined {
    return this._content.key as K | undefined;
  }

  set key(value: unknown) {
    this._content.key = this.refract(value);
  }

  /**
   * The value element of this member.
   */
  get value(): V | undefined {
    return this._content.value as V | undefined;
  }

  set value(value: unknown) {
    this._content.value = value === undefined ? undefined : this.refract(value);
  }
}

export default MemberElement;
