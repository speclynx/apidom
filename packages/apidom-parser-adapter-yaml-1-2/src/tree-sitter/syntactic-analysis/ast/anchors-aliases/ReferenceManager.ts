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
    const { startLine, startCharacter, startOffset, endLine, endCharacter, endOffset } = alias;
    const scalar = new YamlScalar({
      content: alias.content,
      startLine,
      startCharacter,
      startOffset,
      endLine,
      endCharacter,
      endOffset,
      style: YamlStyle.Plain,
      styleGroup: YamlStyleGroup.Flow,
    });
    scalar.alias = alias.content.slice(1);
    return scalar;
  }
}

export default ReferenceManager;
