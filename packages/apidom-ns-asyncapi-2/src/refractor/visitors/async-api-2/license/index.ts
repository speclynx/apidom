import { always } from 'ramda';

import LicenseElement from '../../../../elements/License.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type LicenseVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class LicenseVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: LicenseElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'License']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: LicenseVisitorOptions) {
    super(options);
    this.element = new LicenseElement();
    this.specPath = always(['document', 'objects', 'License']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default LicenseVisitor;
