import {
  LinkDescriptionVisitor as JSONSchemaDraft4LinkDescriptionVisitor,
  LinkDescriptionVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import LinkDescriptionElement from '../../../../elements/LinkDescription.ts';

export type { LinkDescriptionVisitorOptions };

/**
 * @public
 */
class LinkDescriptionVisitor extends JSONSchemaDraft4LinkDescriptionVisitor {
  // @ts-expect-error - widening type to include BooleanElement (boolean schemas introduced in draft-6)
  declare public readonly element: LinkDescriptionElement;

  constructor(options: LinkDescriptionVisitorOptions) {
    super(options);
    this.element = new LinkDescriptionElement();
  }
}

export default LinkDescriptionVisitor;
