import YamlAlias from '../nodes/YamlAlias.ts';
import YamlNode from '../nodes/YamlNode.ts';
import YamlScalar from '../nodes/YamlScalar.ts';
import { YamlStyle, YamlStyleGroup } from '../nodes/YamlStyle.ts';

/**
 * @public
 */
class ReferenceManager {
  addAnchor(_node: YamlNode): void {
    // Anchor registration - currently a no-op as aliases resolve to scalars
  }

  resolveAlias(alias: YamlAlias): YamlScalar {
    return new YamlScalar({
      content: alias.content,
      style: YamlStyle.Plain,
      styleGroup: YamlStyleGroup.Flow,
    });
  }
}

export default ReferenceManager;
