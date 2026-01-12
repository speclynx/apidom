import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsLinksElement from '../../../../elements/nces/ComponentsLinks.ts';
import MapVisitor, { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as LinksVisitorOptions };

/**
 * @public
 */
class LinksVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsLinksElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Link']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ComponentsLinksElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Link'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    MapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'link');
    });
  }
}

export default LinksVisitor;
