import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { SpecPath } from '../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from './bases.ts';
import { isReferenceLikeElement } from '../../predicates.ts';
import { isReferenceElement } from '../../../predicates.ts';
import ReferenceElement from '../../../elements/Reference.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as ExamplesVisitorOptions };

/**
 * @public
 */
class ExamplesVisitor extends BaseMapVisitor {
  declare public readonly element: ObjectElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Example']
  >;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ObjectElement();
    this.element.classes.push('examples');
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Example'];
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'example');
    });
  }
}

export default ExamplesVisitor;
