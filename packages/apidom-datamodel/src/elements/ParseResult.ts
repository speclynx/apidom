import ArrayElement from '../primitives/ArrayElement.ts';
import type Element from '../primitives/Element.ts';
import type { Meta, Attributes } from '../primitives/Element.ts';

/**
 * ParseResultElement represents the result of parsing a document.
 *
 * Contains the parsed API element, any result elements, and annotations
 * (warnings and errors) from the parsing process.
 *
 * @public
 */
class ParseResultElement extends ArrayElement {
  constructor(content?: unknown[], meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'parseResult';
  }

  /**
   * The main API element from the parse result.
   */
  get api(): Element | undefined {
    return this.filter((item) => item.classes.includes('api')).first;
  }

  /**
   * All result elements from the parse result.
   */
  get results(): ArrayElement {
    return this.filter((item) => item.classes.includes('result'));
  }

  /**
   * The first result element.
   */
  get result(): Element | undefined {
    return this.results.first;
  }

  /**
   * All annotation elements (warnings and errors).
   */
  get annotations(): ArrayElement {
    return this.filter((item) => item.element === 'annotation');
  }

  /**
   * All warning annotations.
   */
  get warnings(): ArrayElement {
    return this.filter((item) => item.element === 'annotation' && item.classes.includes('warning'));
  }

  /**
   * All error annotations.
   */
  get errors(): ArrayElement {
    return this.filter((item) => item.element === 'annotation' && item.classes.includes('error'));
  }

  /**
   * Whether the parse result is empty (contains only annotations).
   */
  override get isEmpty(): boolean {
    return this.reject((item) => item.element === 'annotation').length === 0;
  }

  /**
   * Replaces the first result element with the given replacement.
   * @returns true if replacement was successful, false otherwise
   */
  replaceResult(replacement: Element): boolean {
    const { result } = this;

    if (result === undefined) {
      return false;
    }

    const content = this._content as Element[];
    const searchIndex = content.findIndex((e) => e === result);
    if (searchIndex === -1) {
      return false;
    }

    content[searchIndex] = replacement;

    return true;
  }
}

export default ParseResultElement;
