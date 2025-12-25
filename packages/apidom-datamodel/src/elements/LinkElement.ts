import Element, { type Meta, type Attributes } from '../primitives/Element.ts';

/**
 * LinkElement represents a hyperlink in ApiDOM.
 *
 * Hyperlinking MAY be used to link to other resources, provide links to
 * instructions on how to process a given element (by way of a profile or
 * other means), and may be used to provide meta data about the element in
 * which it's found. The meaning and purpose of the hyperlink is defined by
 * the link relation according to RFC 5988.
 *
 * @public
 */
class LinkElement extends Element {
  constructor(content?: unknown, meta?: Meta, attributes?: Attributes) {
    super(content || [], meta, attributes);
    this.element = 'link';
  }

  /**
   * The relation identifier for the link, as defined in RFC 5988.
   */
  get relation(): Element | undefined {
    return this.attributes.get('relation');
  }

  set relation(relation: string | Element | undefined) {
    this.attributes.set('relation', relation);
  }

  /**
   * The URI for the given link.
   */
  get href(): Element | undefined {
    return this.attributes.get('href');
  }

  set href(href: string | Element | undefined) {
    this.attributes.set('href', href);
  }
}

export default LinkElement;
