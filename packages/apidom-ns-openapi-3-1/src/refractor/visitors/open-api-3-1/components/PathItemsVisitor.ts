import { ObjectElement } from '@speclynx/apidom-datamodel';
import { isReferenceLikeElement, MapVisitor, SpecPath } from '@speclynx/apidom-ns-openapi-3-0';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsPathItemsElement from '../../../../elements/nces/ComponentsPathItems.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface PathItemsVisitorOptions extends BaseMapVisitorOptions {}

/**
 * @public
 */
class PathItemsVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsPathItemsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'PathItem']
  >;

  constructor(options: PathItemsVisitorOptions) {
    super(options);
    this.element = new ComponentsPathItemsElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'PathItem'];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = MapVisitor.prototype.ObjectElement.call(this, objectElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      // @ts-ignore
      referenceElement.setMetaProperty('referenced-element', 'pathItem');
    });

    return result;
  }
}

export default PathItemsVisitor;
