import { always } from 'ramda';

import SecurityRequirementElement from '../../../../elements/SecurityRequirement.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as SecurityRequirementVisitorOptions };

/**
 * @public
 */
class SecurityRequirementVisitor extends BaseMapVisitor {
  declare public readonly element: SecurityRequirementElement;

  declare protected readonly specPath: SpecPath<['value']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new SecurityRequirementElement();
    this.specPath = always(['value']);
  }
}

export default SecurityRequirementVisitor;
