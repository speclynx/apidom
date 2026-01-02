import { always } from 'ramda';

import CriterionElement from '../../../../elements/Criterion.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface CriterionVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class CriterionVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: CriterionElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Criterion']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: CriterionVisitorOptions) {
    super(options);
    this.element = new CriterionElement();
    this.specPath = always(['document', 'objects', 'Criterion']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default CriterionVisitor;
