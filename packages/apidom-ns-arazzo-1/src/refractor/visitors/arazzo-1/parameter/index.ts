import { always } from 'ramda';

import ParameterElement from '../../../../elements/Parameter.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ParameterVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ParameterVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: ParameterElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Parameter']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ParameterVisitorOptions) {
    super(options);
    this.element = new ParameterElement();
    this.specPath = always(['document', 'objects', 'Parameter']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ParameterVisitor;
