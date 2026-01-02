import { always } from 'ramda';

import SecurityDefinitionsElement from '../../../../elements/SecurityDefinitions.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as SecurityDefinitionsVisitorOptions };

/**
 * @public
 */
class SecurityDefinitionsVisitor extends BaseMapVisitor {
  public readonly element: SecurityDefinitionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'SecurityScheme']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new SecurityDefinitionsElement();
    this.specPath = always(['document', 'objects', 'SecurityScheme']);
  }
}

export default SecurityDefinitionsVisitor;
