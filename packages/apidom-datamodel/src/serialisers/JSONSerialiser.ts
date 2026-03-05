import type Namespace from '../Namespace.ts';
import type Element from '../primitives/Element.ts';
import type KeyValuePair from '../KeyValuePair.ts';
import type ObjectElement from '../primitives/ObjectElement.ts';
import SourceMapElement from '../elements/SourceMap.ts';
import StyleElement from '../elements/Style.ts';

/**
 * Serialized representation of an Element in JSON Refract format.
 * @public
 */
interface SerializedElement {
  element: string;
  meta?: Record<string, SerializedElement>;
  attributes?: Record<string, SerializedElement>;
  content?: SerializedContent;
  __meta_raw__?: string[];
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
  __meta_raw__?: string[];
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
      const serialisedMeta = this.serialiseMeta(element);
      if (serialisedMeta) {
        payload.meta = serialisedMeta.meta;
        if (serialisedMeta.rawKeys.length > 0) {
          payload.__meta_raw__ = serialisedMeta.rawKeys;
        }
      }
    }

    if (!element.isAttributesEmpty) {
      payload.attributes = this.serialiseObject(element.attributes as ObjectElement);
    }

    // Serialize source position as __mappings__ in meta (skip for SourceMapElement itself)
    if (!(element instanceof SourceMapElement)) {
      const sourceMap = SourceMapElement.from(element);
      if (sourceMap) {
        if (!payload.meta) {
          payload.meta = {};
        }
        payload.meta.__mappings__ = this.serialise(sourceMap);
      }
    }

    // Serialize style as __styles__ in meta (skip for StyleElement itself)
    if (!(element instanceof StyleElement)) {
      const styleElement = StyleElement.from(element);
      if (styleElement) {
        if (!payload.meta) {
          payload.meta = {};
        }
        payload.meta.__styles__ = this.serialise(styleElement);
      }
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

    // Extract special meta keys without mutating input, filter remaining meta
    let mappingsDoc: RefractDocument | undefined;
    let stylesDoc: RefractDocument | undefined;
    let metaToDeserialize = value.meta;

    if (value.meta?.__mappings__ || value.meta?.__styles__) {
      const { __mappings__, __styles__, ...rest } = value.meta as Record<string, unknown>;
      mappingsDoc = __mappings__ as RefractDocument | undefined;
      stylesDoc = __styles__ as RefractDocument | undefined;
      metaToDeserialize = Object.keys(rest).length > 0 ? rest : undefined;
    }

    // determine which meta keys were raw primitives before serialization
    const rawKeys = value.__meta_raw__ ? new Set(value.__meta_raw__) : undefined;

    if (metaToDeserialize) {
      for (const [key, doc] of Object.entries(metaToDeserialize)) {
        const deserialized = this.deserialise(doc as RefractDocument);
        // unwrap keys that were raw primitives before serialization
        element.setMetaProperty(key, rawKeys?.has(key) ? deserialized.toValue() : deserialized);
      }
    }

    // Restore source position from __mappings__
    if (mappingsDoc) {
      const sourceMap = this.deserialise(mappingsDoc) as SourceMapElement;
      sourceMap.applyTo(element);
    }

    // Restore style from __styles__
    if (stylesDoc) {
      const styleElement = this.deserialise(stylesDoc) as StyleElement;
      styleElement.applyTo(element);
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

  protected serialiseMeta(
    element: Element,
  ): { meta: Record<string, SerializedElement>; rawKeys: string[] } | undefined {
    const meta: Record<string, SerializedElement> = {};
    const rawKeys: string[] = [];
    let hasEntries = false;

    for (const [key, value] of Object.entries(element.meta)) {
      if (value instanceof this.namespace.elements.Element) {
        meta[key] = this.serialise(value as Element);
        hasEntries = true;
      } else if (value !== undefined) {
        // refract primitives to maintain JSON Refract spec compatibility
        const refracted = element.refract(value);
        meta[key] = this.serialise(refracted);
        rawKeys.push(key);
        hasEntries = true;
      }
    }

    return hasEntries ? { meta, rawKeys } : undefined;
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
