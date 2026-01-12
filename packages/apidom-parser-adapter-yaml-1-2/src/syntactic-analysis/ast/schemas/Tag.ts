class Tag {
  public static readonly uri: string = '';

  public readonly tag: string = '';

  constructor() {
    this.tag = (this.constructor as typeof Tag).uri;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public test(node: any): boolean {
    return true;
  }

  public resolve(node: any): any {
    return node;
  }
}

export default Tag;
