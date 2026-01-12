import Tag from '../Tag.ts';

class FloatingPoint extends Tag {
  public static readonly uri: string = 'tag:yaml.org,2002:float';

  public test(node: any): boolean {
    return /^-?(0|[1-9][0-9]*)(\.[0-9]*)?([eE][-+]?[0-9]+)?$/.test(node.content);
  }

  public resolve(node: any): any {
    const content = parseFloat(node.content);
    const nodeClone = node.clone();

    nodeClone.content = content;

    return nodeClone;
  }
}

export default FloatingPoint;
