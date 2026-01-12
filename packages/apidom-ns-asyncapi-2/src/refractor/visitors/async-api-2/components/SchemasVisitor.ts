import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsSchemasElement from '../../../../elements/nces/ComponentsSchemas.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type SchemasVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class SchemasVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsSchemasElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Schema']
  >;

  constructor(options: SchemasVisitorOptions) {
    super(options);
    this.element = new ComponentsSchemasElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Schema'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default SchemasVisitor;
