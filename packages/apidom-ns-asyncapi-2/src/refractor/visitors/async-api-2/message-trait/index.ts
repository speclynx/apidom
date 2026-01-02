import { always } from 'ramda';

import MessageTraitElement from '../../../../elements/MessageTrait.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type MessageTraitVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MessageTraitVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MessageTraitElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'MessageTrait']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: MessageTraitVisitorOptions) {
    super(options);
    this.element = new MessageTraitElement();
    this.specPath = always(['document', 'objects', 'MessageTrait']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default MessageTraitVisitor;
