import { Element } from '@speclynx/apidom-core';

/**
 * @public
 */
export interface ParentSchemaAwareVisitorOptions {
  readonly parent: Element;
}

/**
 * @public
 */
class ParentSchemaAwareVisitor {
  public parent: Element;

  constructor({ parent }: ParentSchemaAwareVisitorOptions) {
    this.parent = parent;
  }
}

export default ParentSchemaAwareVisitor;
