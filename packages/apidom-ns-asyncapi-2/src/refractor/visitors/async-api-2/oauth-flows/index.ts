import { always } from 'ramda';

import OAuthFlowsElement from '../../../../elements/OAuthFlows.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type OAuthFlowsVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class OAuthFlowsVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: OAuthFlowsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'OAuthFlows']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: OAuthFlowsVisitorOptions) {
    super(options);
    this.element = new OAuthFlowsElement();
    this.specPath = always(['document', 'objects', 'OAuthFlows']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default OAuthFlowsVisitor;
