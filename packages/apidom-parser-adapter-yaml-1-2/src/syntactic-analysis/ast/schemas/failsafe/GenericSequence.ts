import Tag from '../Tag.ts';
import { YamlNodeKind } from '../../nodes/YamlTag.ts';

class GenericSequence extends Tag {
  public static readonly uri: string = 'tag:yaml.org,2002:seq';

  public test(node: any): boolean {
    return node.tag.kind === YamlNodeKind.Sequence;
  }
}

export default GenericSequence;
