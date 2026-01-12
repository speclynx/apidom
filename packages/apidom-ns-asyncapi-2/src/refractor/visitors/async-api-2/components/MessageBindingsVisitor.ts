import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsMessageBindingsElement from '../../../../elements/nces/ComponentsMessageBindings.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type MessageBindingsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class MessageBindingsVisitor extends BaseMapVisitor {
  declare public element: ComponentsMessageBindingsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'MessageBindings']
  >;

  constructor(options: MessageBindingsVisitorOptions) {
    super(options);
    this.element = new ComponentsMessageBindingsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'MessageBindings'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'messageBindings');
    });
  }
}

export default MessageBindingsVisitor;
