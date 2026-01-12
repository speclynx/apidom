import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { SpecPath } from '../../generics/PatternedFieldsVisitor.ts';
import ParametersElement from '../../../../elements/Parameters.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import ReferenceElement from '../../../../elements/Reference.ts';
import { BasePatternedFieldsVisitor, BasePatternedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type ParametersVisitorOptions = BasePatternedFieldsVisitorOptions;

/**
 * @public
 */
class ParametersVisitor extends BasePatternedFieldsVisitor {
  declare public readonly element: ParametersElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Parameter'] | ['value']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: ParametersVisitorOptions) {
    super(options);
    this.element = new ParametersElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Parameter'];
    this.canSupportSpecificationExtensions = false;
    this.fieldPatternPredicate = (value: unknown) =>
      typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value);
  }

  ObjectElement(path: Path<ObjectElement>) {
    BasePatternedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'parameter');
    });
  }
}

export default ParametersVisitor;
