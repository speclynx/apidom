import { always } from 'ramda';

import ParameterElement from '../../../../elements/Parameter.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as ParameterVisitorOptions };

/**
 * @public
 */
class ParameterVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ParameterElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Parameter']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ParameterElement();
    this.specPath = always(['document', 'objects', 'Parameter']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ParameterVisitor;
