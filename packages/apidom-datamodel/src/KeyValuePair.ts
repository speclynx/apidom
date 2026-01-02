import type Element from './primitives/Element.ts';

/**
 * Represents a key-value pair used in MemberElement content.
 * This is used internally to store object member data.
 *
 * @typeParam K - Key element type
 * @typeParam V - Value element type
 * @public
 */
class KeyValuePair<K extends Element = Element, V extends Element = Element> {
  public key: K | undefined;
  public value: V | undefined;

  constructor(key?: K, value?: V) {
    this.key = key;
    this.value = value;
  }

  /**
   * Converts to a plain JavaScript object representation.
   */
  toValue(): { key: unknown; value: unknown } {
    return {
      key: this.key?.toValue(),
      value: this.value?.toValue(),
    };
  }
}

export default KeyValuePair;
