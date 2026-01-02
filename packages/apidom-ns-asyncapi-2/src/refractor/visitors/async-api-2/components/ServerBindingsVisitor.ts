import { ObjectElement } from '@speclynx/apidom-datamodel';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsServerBindingsElement from '../../../../elements/nces/ComponentsServerBindings.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ServerBindingsVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class ServerBindingsVisitor extends BaseMapVisitor {
  declare public element: ComponentsServerBindingsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'ServerBindings']
  >;

  constructor(options: ServerBindingsVisitorOptions) {
    super(options);
    this.element = new ComponentsServerBindingsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'ServerBindings'];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'serverBindings');
    });

    return result;
  }
}

export default ServerBindingsVisitor;
