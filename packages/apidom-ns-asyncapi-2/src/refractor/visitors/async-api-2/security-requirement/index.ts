import { always } from 'ramda';

import { SpecPath } from '../../generics/MapVisitor.ts';
import SecurityRequirementElement from '../../../../elements/SecurityRequirement.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type SecurityRequirementVisitorOptions = BaseMapVisitorOptions;

/**
 * @public
 */
class SecurityRequirementVisitor extends BaseMapVisitor {
  declare public readonly element: SecurityRequirementElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: SecurityRequirementVisitorOptions) {
    super(options);
    this.element = new SecurityRequirementElement();
    this.specPath = always(['value']);
  }
}

export default SecurityRequirementVisitor;
