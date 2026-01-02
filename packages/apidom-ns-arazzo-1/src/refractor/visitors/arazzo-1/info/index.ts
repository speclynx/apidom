import { always } from 'ramda';

import InfoElement from '../../../../elements/Info.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface InfoVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class InfoVisitor extends BaseFixedFieldsFallbackVisitor {
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
