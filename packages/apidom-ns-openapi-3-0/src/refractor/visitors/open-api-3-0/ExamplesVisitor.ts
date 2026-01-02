import { ObjectElement } from '@speclynx/apidom-datamodel';

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

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'example');
    });

    return result;
  }
}

export default ExamplesVisitor;
