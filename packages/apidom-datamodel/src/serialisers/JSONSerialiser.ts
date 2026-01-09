import type Namespace from '../Namespace.ts';
import type Element from '../primitives/Element.ts';
import type KeyValuePair from '../KeyValuePair.ts';
import type ObjectElement from '../primitives/ObjectElement.ts';

/**
 * Serialized representation of an Element in JSON Refract format.
 * @public
 */
interface SerializedElement {
  element: string;
  meta?: Record<string, SerializedElement>;
  attributes?: Record<string, SerializedElement>;
  content?: SerializedContent;
}

/**
 * Serialized representation of a KeyValuePair in JSON Refract format.
 * @public
 */
interface SerializedKeyValuePair {
  key: SerializedElement;
  value?: SerializedElement;
}

/**
 * Possible content types in a serialized element.
 * @public
 */
type SerializedContent =
  | SerializedElement
  | SerializedElement[]
  | SerializedKeyValuePair
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Input document format for deserialization.
 * @public
 */
interface RefractDocument {
  element: string;
  meta?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  content?: unknown;
}

/**
 * JSONSerialiser handles serialization and deserialization of ApiDOM elements
 * to and from JSON Refract format.
 * @public
 */
class JSONSerialiser {
  public namespace: Namespace;

  // This will be set via prototype assignment to avoid circular dependency
  declare Namespace: typeof Namespace;

  constructor(namespace?: Namespace) {
    this.namespace = namespace || new this.Namespace();
  }

  /**
   * Serializes an Element to JSON Refract format.
   */
  serialise(element: Element): SerializedElement {
    if (!(element instanceof this.namespace.elements.Element)) {
      throw new TypeError(`Given element \`${element}\` is not an Element instance`);
    }

    const payload: SerializedElement = {
      element: element.element,
    };

    if (!element.isMetaEmpty) {
      payload.meta = this.serialiseObject(element.meta as ObjectElement);
    }

    if (!element.isAttributesEmpty) {
      payload.attributes = this.serialiseObject(element.attributes as ObjectElement);
    }

    const content = this.serialiseContent(element.content);

    if (content !== undefined) {
      payload.content = content;
    }

    return payload;
  }

  /**
   * Deserializes a JSON Refract document to an Element.
   */
  deserialise(value: RefractDocument): Element {
    if (!value.element) {
      throw new Error('Given value is not an object containing an element name');
    }

    const ElementClass = this.namespace.getElementClass(value.element);
    const element = new ElementClass();

    if (element.element !== value.element) {
      element.element = value.element;
    }

    if (value.meta) {
      this.deserialiseObject(
        value.meta as Record<string, RefractDocument>,
        element.meta as ObjectElement,
      );
    }

    if (value.attributes) {
      this.deserialiseObject(
        value.attributes as Record<string, RefractDocument>,
        element.attributes as ObjectElement,
      );
    }

    const content = this.deserialiseContent(value.content);
    if (content !== undefined || element.content === null) {
      element.content = content;
    }

    return element;
  }

  protected serialiseContent(content: unknown): SerializedContent {
    if (content instanceof this.namespace.elements.Element) {
      return this.serialise(content as Element);
    }

    if (content instanceof this.namespace.KeyValuePair) {
      const kvp = content as KeyValuePair;
      const pair: SerializedKeyValuePair = {
        key: this.serialise(kvp.key as Element),
      };

      if (kvp.value) {
        pair.value = this.serialise(kvp.value as Element);
      }

      return pair;
    }

    if (content && Array.isArray(content)) {
      if (content.length === 0) {
        return undefined;
      }

      return content.map((item) => this.serialise(item));
    }

    return content as SerializedContent;
  }

  protected deserialiseContent(content: unknown): unknown {
    if (content) {
      if ((content as RefractDocument).element) {
        return this.deserialise(content as RefractDocument);
      }

      if ((content as SerializedKeyValuePair).key) {
        const pair = new this.namespace.KeyValuePair(
          this.deserialise((content as SerializedKeyValuePair).key),
        );

        if ((content as SerializedKeyValuePair).value) {
          pair.value = this.deserialise((content as SerializedKeyValuePair).value!);
        }

        return pair;
      }

      if (Array.isArray(content)) {
        return content.map((item) => this.deserialise(item));
      }
    }

    return content;
  }

  protected serialiseObject(obj: ObjectElement): Record<string, SerializedElement> | undefined {
    const result: Record<string, SerializedElement> = {};

    obj.forEach((value: Element, key: Element) => {
      if (value) {
        result[key.toValue() as string] = this.serialise(value);
      }
    });

    if (Object.keys(result).length === 0) {
      return undefined;
    }

    return result;
  }

  protected deserialiseObject(from: Record<string, RefractDocument>, to: ObjectElement): void {
    Object.keys(from).forEach((key) => {
      to.set(key, this.deserialise(from[key]));
    });
  }
}

export default JSONSerialiser;

export type { SerializedElement, SerializedContent, SerializedKeyValuePair, RefractDocument };
