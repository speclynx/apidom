import Tag from '../Tag.ts';

class Boolean extends Tag {
  public static readonly uri: string = 'tag:yaml.org,2002:bool';

  public test(node: any): boolean {
    return /^(true|false)$/.test(node.content);
  }

  public resolve(node: any): any {
    const content = node.content === 'true';
    const nodeClone = node.clone();

    nodeClone.content = content;

    return nodeClone;
  }
}

export default Boolean;
