import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ComponentsSecuritySchemesElement from '../../../../elements/nces/ComponentsSecuritySchemes.ts';
import MapVisitor, { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as SecuritySchemesVisitorOptions };

/**
 * @public
 */
class SecuritySchemesVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsSecuritySchemesElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'SecurityScheme']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ComponentsSecuritySchemesElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'SecurityScheme'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    MapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'securityScheme');
    });
  }
}

export default SecuritySchemesVisitor;
