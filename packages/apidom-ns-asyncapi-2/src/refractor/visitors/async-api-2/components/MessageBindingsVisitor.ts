import { ObjectElement } from '@speclynx/apidom-datamodel';

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

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'messageBindings');
    });

    return result;
  }
}

export default MessageBindingsVisitor;
