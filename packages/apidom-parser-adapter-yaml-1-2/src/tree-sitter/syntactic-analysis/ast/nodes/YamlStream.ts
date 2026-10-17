import Node from '../Node.ts';
import YamlDocument from './YamlDocument.ts';
import YamlComment from './YamlComment.ts';
import { isDocument, isComment } from './predicates.ts';

/**
 * @public
 */
class YamlStream extends Node {
  public static readonly type = 'stream';

  // the line break the stream's first line ends with
  public lineBreak?: string;
}

Object.defineProperty(YamlStream.prototype, 'content', {
  get(): Array<YamlDocument | YamlComment> {
    return Array.isArray(this.children)
      ? this.children.filter((node: unknown) => isDocument(node) || isComment(node))
      : [];
  },
  enumerable: true,
});

export default YamlStream;
