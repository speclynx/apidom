import { equals } from 'ramda';

import type { Meta, Attributes, ToValue, Equatable, Freezable } from '../types.ts';
import type ObjectElement from './ObjectElement.ts';
import type ArrayElement from './ArrayElement.ts';
import KeyValuePair from '../KeyValuePair.ts';
import ObjectSlice from '../ObjectSlice.ts';

/**
 * Valid content types for an Element.
 * @public
 */
export type ElementContent =
  | Element
  | Element[]
  | KeyValuePair
  | string
  | number
  | bigint
  | symbol
  | boolean
  | null
  | undefined;

/**
 * Base Element class that all ApiDOM elements extend.
 *
 * Elements are the core building blocks of ApiDOM. Each element has:
 * - An `element` property identifying its type
 * - Optional `content` holding the element's value
 * - Optional `meta` for metadata (id, classes, title, description, links)
 * - Optional `attributes` for element-specific properties
 *
 * @public
 */
class Element implements ToValue, Equatable, Freezable {
  // ============================================================
  // Public Properties
  // ============================================================

  /**
   * Parent element reference (set when tree is frozen).
   */
  public parent?: Element;

  // ============================================================================
  // Source Position (LSP-compatible, TextDocument-compatible, UTF-16 code units)
  // web-tree-sitter automatically provides position data in UTF-16 code units.
  // ============================================================================

  /**
   * Starting line number (0-based).
   * Compatible with LSP Position.line.
   */
  public startLine?: number;

  /**
   * Starting character offset within the line (0-based, UTF-16 code units).
   * Compatible with LSP Position.character.
   */
  public startCharacter?: number;

  /**
   * Starting offset from beginning of document (UTF-16 code units).
   * Can be used directly as JavaScript string index.
   */
  public startOffset?: number;

  /**
   * Ending line number (0-based).
   * Compatible with LSP Position.line.
   */
  public endLine?: number;

  /**
   * Ending character offset within the line (0-based, UTF-16 code units).
   * Compatible with LSP Position.character.
   */
  public endCharacter?: number;

  /**
   * Ending offset from beginning of document (UTF-16 code units).
   * Can be used directly as JavaScript string index.
   */
  public endOffset?: number;

  // ============================================================
  // Protected Properties
  // ============================================================

  /**
   * The element type identifier.
   * @internal
   */
  protected _storedElement: string = 'element';

  /**
   * The element's content/value.
   * @internal
   */
  protected _content?: ElementContent;

  /**
   * Metadata about this element.
   * @internal
   */
  protected _meta?: Element;

  /**
   * Element-specific attributes.
   * @internal
   */
  protected _attributes?: Element;

  // ============================================================
  // Prototype-assigned properties (set in elements.ts)
  // Using 'declare' allows TypeScript to know about these
  // without generating runtime code.
  // ============================================================

  /** @internal ObjectElement constructor for creating meta/attributes */
  declare ObjectElement: new (content?: Record<string, unknown>) => ObjectElement;

  /** @internal ArrayElement constructor for creating arrays */
  declare ArrayElement: new (content?: Element[]) => ArrayElement;

  /** @internal MemberElement constructor for creating object members */
  declare MemberElement: new (key?: unknown, value?: unknown) => Element;

  /** @internal RefElement constructor for creating references */
  declare RefElement: new (content?: unknown) => Element & { path?: Element };

  /** @internal Function to convert values to elements */
  declare refract: (value: unknown) => Element;

  constructor(content?: unknown, meta?: Meta, attributes?: Attributes) {
    if (meta !== undefined) {
      this.meta = meta;
    }

    if (attributes !== undefined) {
      this.attributes = attributes;
    }

    if (content !== undefined) {
      this.content = content;
    }
  }

  // ============================================================
  // Core Properties
  // ============================================================

  /**
   * The element type identifier (e.g., 'string', 'object', 'array').
   */
  get element(): string {
    return this._storedElement;
  }

  set element(value: string) {
    this._storedElement = value;
  }

  /**
   * The element's content/value.
   */
  get content(): ElementContent {
    return this._content;
  }

  set content(value: unknown) {
    // Already an element
    if (value instanceof Element) {
      this._content = value;
      return;
    }

    // Primitives (inlined for performance - avoids 8 function calls)
    if (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint' ||
      typeof value === 'symbol'
    ) {
      this._content = value;
      return;
    }

    // KeyValuePair
    if (value instanceof KeyValuePair) {
      this._content = value;
      return;
    }

    // ObjectSlice - extract elements array
    if (value instanceof ObjectSlice) {
      this._content = value.elements;
      return;
    }

    // Array - refract each item
    if (Array.isArray(value)) {
      this._content = value.map((item) => this.refract(item));
      return;
    }

    // Plain object - convert to MemberElements
    if (typeof value === 'object') {
      this._content = Object.entries(value as Record<string, unknown>).map(
        ([key, val]) => new this.MemberElement(key, val),
      );
      return;
    }

    throw new Error(`Cannot set content to value of type ${typeof value}`);
  }

  /**
   * Metadata about this element (id, classes, title, description, links).
   * Lazily creates an ObjectElement if not set.
   */
  get meta(): ObjectElement {
    if (!this._meta) {
      if (this.isFrozen) {
        const meta = new this.ObjectElement();
        meta.freeze();
        return meta;
      }
      this._meta = new this.ObjectElement();
    }
    return this._meta as ObjectElement;
  }

  set meta(value: Meta) {
    if (value instanceof Element) {
      this._meta = value;
    } else {
      this.meta.set(value ?? {});
    }
  }

  /**
   * Element-specific attributes.
   * Lazily creates an ObjectElement if not set.
   */
  get attributes(): ObjectElement {
    if (!this._attributes) {
      if (this.isFrozen) {
        const attributes = new this.ObjectElement();
        attributes.freeze();
        return attributes;
      }
      this._attributes = new this.ObjectElement();
    }
    return this._attributes as ObjectElement;
  }

  set attributes(value: Attributes) {
    if (value instanceof Element) {
      this._attributes = value;
    } else {
      this.attributes.set(value ?? {});
    }
  }

  // ============================================================
  // Meta Property Shortcuts
  // ============================================================

  /** Unique identifier for this element. */
  get id(): Element {
    return this.getMetaProperty('id', '');
  }

  set id(value: Element | string) {
    this.setMetaProperty('id', value);
  }

  /** CSS-like class names. */
  get classes(): ArrayElement {
    return this.getMetaProperty('classes', []) as ArrayElement;
  }

  set classes(value: ArrayElement | unknown[]) {
    this.setMetaProperty('classes', value);
  }

  /** Hyperlinks associated with this element. */
  get links(): ArrayElement {
    return this.getMetaProperty('links', []) as ArrayElement;
  }

  set links(value: ArrayElement | unknown[]) {
    this.setMetaProperty('links', value);
  }

  // ============================================================
  // Tree Navigation
  // ============================================================

  /** Returns direct children of this element. */
  get children(): Element[] {
    const { _content: content } = this;

    if (Array.isArray(content)) {
      return content;
    }

    if (content instanceof KeyValuePair) {
      const children: Element[] = [];
      if (content.key) children.push(content.key as Element);
      if (content.value) children.push(content.value as Element);
      return children;
    }

    if (content instanceof Element) {
      return [content];
    }

    return [];
  }

  // ============================================================
  // Freezable Implementation
  // ============================================================

  /** Whether this element is frozen (immutable). */
  get isFrozen(): boolean {
    return Object.isFrozen(this);
  }

  /**
   * Freezes the element tree, making it immutable.
   * Sets up parent references for tree traversal.
   */
  freeze(): void {
    if (this.isFrozen) return;

    // Freeze meta and attributes
    if (this._meta) {
      this._meta.parent = this;
      this._meta.freeze();
    }

    if (this._attributes) {
      this._attributes.parent = this;
      this._attributes.freeze();
    }

    // Freeze children
    for (const child of this.children) {
      child.parent = this;
      child.freeze();
    }

    // Freeze content array if applicable
    if (Array.isArray(this._content)) {
      Object.freeze(this._content);
    }

    Object.freeze(this);
  }

  // ============================================================
  // ToValue Implementation
  // ============================================================

  /**
   * Converts the element to its JavaScript value representation.
   */
  toValue(): unknown {
    const { _content } = this;

    if (_content instanceof Element) {
      return _content.toValue();
    }

    if (_content instanceof KeyValuePair) {
      return _content.toValue();
    }

    if (Array.isArray(_content)) {
      return _content.map((el) => el.toValue());
    }

    return _content;
  }

  // ============================================================
  // Equatable Implementation
  // ============================================================

  /**
   * Checks deep equality with another value.
   */
  equals(value: unknown): boolean {
    const compareTo: unknown = value instanceof Element ? value.toValue() : value;
    return equals(this.toValue(), compareTo);
  }

  // ============================================================
  // Element Type
  // ============================================================

  /**
   * Returns the primitive type name for this element.
   * Override in subclasses (e.g., 'string', 'number', 'array').
   */
  primitive(): string | undefined {
    return undefined;
  }

  // ============================================================
  // Content Operations
  // ============================================================

  /**
   * Sets the content of this element.
   * @returns this for chaining
   */
  set(content: unknown): this {
    this.content = content;
    return this;
  }

  // ============================================================
  // Reference Creation
  // ============================================================

  /**
   * Creates a RefElement pointing to this element.
   * @param path - Optional path within the referenced element
   * @throws Error if this element has no ID
   */
  toRef(path?: string): Element {
    const idValue = this.id.toValue();
    if (idValue === '') {
      throw new Error('Cannot create reference to an element without an ID');
    }

    const ref = new this.RefElement(idValue);
    if (typeof path === 'string') {
      ref.path = this.refract(path);
    }

    return ref;
  }

  /**
   * Gets a meta property, creating it with default value if not present.
   */
  public getMetaProperty(name: string, defaultValue: unknown): Element {
    if (!this.meta.hasKey(name)) {
      if (this.isFrozen) {
        const element = this.refract(defaultValue);
        element.freeze();
        return element;
      }
      this.meta.set(name, defaultValue);
    }
    return this.meta.get(name)!;
  }

  /**
   * Sets a meta property.
   */
  public setMetaProperty(name: string, value: unknown): void {
    this.meta.set(name, value);
  }

  /**
   * Has meta property.
   */
  public hasMetaProperty(name: string): boolean {
    if (!this.isMetaEmpty) {
      return this.meta.hasKey(name);
    }
    return false;
  }

  /**
   * Checks if meta is empty.
   */
  get isMetaEmpty(): boolean {
    return this._meta === undefined || this.meta.isEmpty;
  }

  /**
   * Gets an attribute property, creating it with default value if not present.
   */
  public getAttributesProperty(name: string, defaultValue: unknown): Element {
    if (!this.hasAttributesProperty(name)) {
      if (this.isFrozen) {
        const element = this.refract(defaultValue);
        element.freeze();
        return element;
      }
      this.attributes.set(name, defaultValue);
    }
    return this.attributes.get(name)!;
  }

  /**
   * Sets an attributes property.
   */
  public setAttributesProperty(name: string, value: unknown): void {
    this.attributes.set(name, value);
  }

  /**
   * Has attributes property.
   */
  public hasAttributesProperty(name: string): boolean {
    if (!this.isAttributesEmpty) {
      return this.attributes.hasKey(name);
    }
    return false;
  }

  /**
   * Checks if attributes is empty.
   */
  get isAttributesEmpty(): boolean {
    return this._attributes === undefined || this.attributes.isEmpty;
  }
}

// Re-export types for convenience
export type { Meta, Attributes };
export default Element;
