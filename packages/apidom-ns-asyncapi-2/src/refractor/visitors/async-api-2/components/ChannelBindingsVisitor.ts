import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsChannelBindingsElement from '../../../../elements/nces/ComponentsChannelBindings.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ChannelBindingsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class ChannelBindingsVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsChannelBindingsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'ChannelBindings']
  >;

  constructor(options: ChannelBindingsVisitorOptions) {
    super(options);
    this.element = new ComponentsChannelBindingsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'ChannelBindings'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'channelBindings');
    });
  }
}

export default ChannelBindingsVisitor;
