import { always } from 'ramda';

import ActionElement from '../../../../elements/Action.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface ActionVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class ActionVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: ActionElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Action']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ActionVisitorOptions) {
    super(options);
    this.element = new ActionElement();
    this.specPath = always(['document', 'objects', 'Action']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ActionVisitor;
