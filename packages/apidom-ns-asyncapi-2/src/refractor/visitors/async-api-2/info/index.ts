import { always } from 'ramda';

import InfoElement from '../../../../elements/Info.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type InfoVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class InfoVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: InfoElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Info']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: InfoVisitorOptions) {
    super(options);
    this.element = new InfoElement();
    this.specPath = always(['document', 'objects', 'Info']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default InfoVisitor;
