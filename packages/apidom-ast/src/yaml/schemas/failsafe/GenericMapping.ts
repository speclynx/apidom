import Tag from '../Tag.ts';
import { YamlNodeKind } from '../../nodes/YamlTag.ts';

class GenericMapping extends Tag {
  public static readonly uri: string = 'tag:yaml.org,2002:map';

  public test(node: any): boolean {
    return node.tag.kind === YamlNodeKind.Mapping;
  }
}

export default GenericMapping;
