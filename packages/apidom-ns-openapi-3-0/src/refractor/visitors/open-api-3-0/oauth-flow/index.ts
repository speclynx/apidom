import { always } from 'ramda';

import OAuthFlowElement from '../../../../elements/OAuthFlow.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as OAuthFlowVisitorOptions };

/**
 * @public
 */
class OAuthFlowVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: OAuthFlowElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'OAuthFlow']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new OAuthFlowElement();
    this.specPath = always(['document', 'objects', 'OAuthFlow']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default OAuthFlowVisitor;
