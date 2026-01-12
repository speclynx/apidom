import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsMessagesElement from '../../../../elements/nces/ComponentsMessages.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type MessagesVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class MessagesVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsMessagesElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Message']
  >;

  constructor(options: MessagesVisitorOptions) {
    super(options);
    this.element = new ComponentsMessagesElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Message'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'message');
    });
  }
}

export default MessagesVisitor;
