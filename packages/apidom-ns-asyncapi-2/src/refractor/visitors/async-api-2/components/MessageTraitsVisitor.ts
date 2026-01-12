import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsMessageTraitsElement from '../../../../elements/nces/ComponentsMessageTraits.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type MessageTraitsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class MessageTraitsVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsMessageTraitsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'MessageTrait']
  >;

  constructor(options: MessageTraitsVisitorOptions) {
    super(options);
    this.element = new ComponentsMessageTraitsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'MessageTrait'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'messageTrait');
    });
  }
}

export default MessageTraitsVisitor;
