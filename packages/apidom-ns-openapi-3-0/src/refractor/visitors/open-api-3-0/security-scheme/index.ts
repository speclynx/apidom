import { always } from 'ramda';

import SecuritySchemeElement from '../../../../elements/SecurityScheme.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as SecuritySchemeVisitorOptions };

/**
 * @public
 */
class SecuritySchemeVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SecuritySchemeElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'SecurityScheme']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new SecuritySchemeElement();
    this.specPath = always(['document', 'objects', 'SecurityScheme']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default SecuritySchemeVisitor;
