import YamlCollection from './YamlCollection.ts';
import YamlKeyValuePair from './YamlKeyValuePair.ts';
import { isKeyValuePair } from './predicates.ts';

/**
 * @public
 */
class YamlMapping extends YamlCollection {
  public static readonly type = 'mapping';
}

Object.defineProperty(YamlMapping.prototype, 'content', {
  get(): Array<YamlKeyValuePair> {
    return Array.isArray(this.children) ? this.children.filter(isKeyValuePair) : [];
  },
  enumerable: true,
});

export default YamlMapping;
