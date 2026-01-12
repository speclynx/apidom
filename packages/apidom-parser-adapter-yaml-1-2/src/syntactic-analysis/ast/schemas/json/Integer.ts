import Tag from '../Tag.ts';

class Integer extends Tag {
  public static readonly uri: string = 'tag:yaml.org,2002:int';

  public test(node: any): boolean {
    return /^-?(0|[1-9][0-9]*)$/.test(node.content);
  }

  public resolve(node: any): any {
    const content = parseInt(node.content, 10);
    const nodeClone = node.clone();

    nodeClone.content = content;

    return nodeClone;
  }
}

export default Integer;
