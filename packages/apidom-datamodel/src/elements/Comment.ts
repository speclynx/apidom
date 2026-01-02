import StringElement from '../primitives/StringElement.ts';
import type { Meta, Attributes } from '../types.ts';

/**
 * CommentElement represents a comment in the source document.
 *
 * @public
 */
class CommentElement extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'comment';
  }
}

export default CommentElement;
