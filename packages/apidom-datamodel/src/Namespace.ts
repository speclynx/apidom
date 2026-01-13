import JSONSerialiser from './serialisers/JSONSerialiser.ts';
import * as elements from './registration.ts';
import type Element from './primitives/Element.ts';
import type ElementConstructor from './primitives/Element.ts';
import type KeyValuePairConstructor from './KeyValuePair.ts';

const isNull = (value: unknown): value is null => value === null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

/**
 * Constructor type for Element classes.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ElementClass = new (...args: any[]) => Element;

/**
 * Function to test if a value should be converted to a specific element type.
 * @public
 */
type DetectionTest = (value: unknown) => boolean;

/**
 * Tuple of detection test and element class.
 * @public
 */
type DetectionEntry = [DetectionTest, ElementClass];

/**
 * Options for Namespace constructor.
 * @public
 */
interface NamespaceOptions {
  noDefault?: boolean;
}

/**
 * Plugin interface for extending Namespace.
 * @public
 */
interface NamespacePlugin {
  namespace?: (options: { base: Namespace }) => void;
  load?: (options: { base: Namespace }) => void;
}

/**
 * Map of registered element classes.
 * @public
 */
interface ElementsMap {
  Element: ElementClass;
  [key: string]: ElementClass;
}

/**
 * A refract element implementation with an extensible namespace, able to
 * load other namespaces into it.
 *
 * The namespace allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing JavaScript objects.
 *
 * @public
 */
class Namespace {
  public elementMap: Record<string, ElementClass> = {};
  public elementDetection: DetectionEntry[] = [];
  public Element: typeof ElementConstructor;
  public KeyValuePair: typeof KeyValuePairConstructor;

  protected _elements?: ElementsMap;
  protected _attributeElementKeys: string[] = [];
  protected _attributeElementArrayKeys: string[] = [];

  constructor(options?: NamespaceOptions) {
    this.Element = elements.Element;
    this.KeyValuePair = elements.KeyValuePair;

    if (!options || !options.noDefault) {
      this.useDefault();
    }
  }

  /**
   * Use a namespace plugin or load a generic plugin.
   */
  use(plugin: NamespacePlugin): this {
    if (plugin.namespace) {
      plugin.namespace({ base: this });
    }
    if (plugin.load) {
      plugin.load({ base: this });
    }
    return this;
  }

  /**
   * Use the default namespace. This preloads all the default elements
   * into this registry instance.
   */
  useDefault(): this {
    // Set up classes for default elements
    this.register('null', elements.NullElement)
      .register('string', elements.StringElement)
      .register('number', elements.NumberElement)
      .register('boolean', elements.BooleanElement)
      .register('array', elements.ArrayElement)
      .register('object', elements.ObjectElement)
      .register('member', elements.MemberElement)
      .register('ref', elements.RefElement)
      .register('link', elements.LinkElement)
      .register('sourceMap', elements.SourceMapElement);

    // Add instance detection functions to convert existing objects into
    // the corresponding refract elements.
    this.detect(isNull, elements.NullElement, false)
      .detect(isString, elements.StringElement, false)
      .detect(isNumber, elements.NumberElement, false)
      .detect(isBoolean, elements.BooleanElement, false)
      .detect(Array.isArray, elements.ArrayElement, false)
      .detect(isObject, elements.ObjectElement, false);

    return this;
  }

  /**
   * Register a new element class for an element.
   */
  register(name: string, ElementClass: ElementClass): this {
    this._elements = undefined;
    this.elementMap[name] = ElementClass;
    return this;
  }

  /**
   * Unregister a previously registered class for an element.
   */
  unregister(name: string): this {
    this._elements = undefined;
    delete this.elementMap[name];
    return this;
  }

  /**
   * Add a new detection function to determine which element
   * class to use when converting existing JS instances into
   * refract elements.
   */
  detect(test: DetectionTest, ElementClass: ElementClass, givenPrepend?: boolean): this {
    const prepend = givenPrepend === undefined ? true : givenPrepend;

    if (prepend) {
      this.elementDetection.unshift([test, ElementClass]);
    } else {
      this.elementDetection.push([test, ElementClass]);
    }

    return this;
  }

  /**
   * Convert an existing JavaScript object into refract element instances.
   * If the item passed in is already refracted, then it is returned unmodified.
   */
  toElement(value: unknown): Element | undefined {
    if (value instanceof this.Element) {
      return value as Element;
    }

    let element: Element | undefined;

    for (const [test, ElementClass] of this.elementDetection) {
      if (test(value)) {
        element = new ElementClass(value);
        break;
      }
    }

    return element;
  }

  /**
   * Get an element class given an element name.
   */
  getElementClass(element: string): ElementClass {
    const ElementClass = this.elementMap[element];

    if (ElementClass === undefined) {
      // Fall back to the base element. We may not know what
      // to do with the `content`, but downstream software
      // may know.
      return this.Element as unknown as ElementClass;
    }

    return ElementClass;
  }

  /**
   * Convert a refract document into refract element instances.
   */
  fromRefract(doc: Record<string, unknown>): Element {
    return this.serialiser.deserialise(
      doc as unknown as Parameters<JSONSerialiser['deserialise']>[0],
    );
  }

  /**
   * Convert an element to a Refracted JSON object.
   */
  toRefract(element: Element): ReturnType<JSONSerialiser['serialise']> {
    return this.serialiser.serialise(element);
  }

  /**
   * Get an object that contains all registered element classes, where
   * the key is the PascalCased element name and the value is the class.
   */
  get elements(): ElementsMap {
    if (this._elements === undefined) {
      this._elements = {
        Element: this.Element,
      };

      Object.keys(this.elementMap).forEach((name) => {
        // Currently, all registered element types use a camelCaseName.
        // Converting to PascalCase is as simple as upper-casing the first letter.
        const pascal = name[0].toUpperCase() + name.substring(1);
        this._elements![pascal] = this.elementMap[name];
      });
    }

    return this._elements;
  }

  /**
   * Convenience method for getting a JSON Serialiser configured with the
   * current namespace.
   */
  get serialiser(): JSONSerialiser {
    return new JSONSerialiser(this);
  }
}

// Set up the circular reference for JSONSerialiser
JSONSerialiser.prototype.Namespace = Namespace;

export default Namespace;

export type {
  ElementClass,
  DetectionTest,
  DetectionEntry,
  NamespaceOptions,
  NamespacePlugin,
  ElementsMap,
};
