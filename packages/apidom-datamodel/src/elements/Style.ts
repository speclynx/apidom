import ObjectElement from '../primitives/ObjectElement.ts';
import type { Meta, Attributes } from '../types.ts';

/**
 * Shape with optional style property.
 * @public
 */
interface StyleShape {
  style?: Record<string, unknown>;
}

/**
 * StyleElement stores format-specific style information for round-trip preservation.
 *
 * The style data is stored as a plain object with format-specific namespaces
 * (e.g., `yaml`, `json`). This element exists only during serialization/deserialization
 * (refract format) - in memory, style lives directly on `element.style`.
 *
 * Follows the same pattern as SourceMapElement with __mappings__.
 *
 * @public
 */
class StyleElement extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = '__styles__';
  }

  /**
   * Transfers style property from one element to another.
   */
  static transfer(from: StyleShape, to: StyleShape): void {
    to.style = from.style;
  }

  /**
   * Creates a StyleElement from an element's style property.
   * Returns undefined if the element has no style.
   */
  static from(source: StyleShape): StyleElement | undefined {
    if (!source.style) {
      return undefined;
    }
    return new StyleElement(source.style);
  }

  /**
   * Restores the style property on the target element from this StyleElement.
   */
  public applyTo(target: StyleShape): void {
    target.style = this.toValue() as Record<string, unknown>;
  }
}

export default StyleElement;
export type { StyleShape };
