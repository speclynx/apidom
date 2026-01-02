import { always } from 'ramda';

import MessageBindingsElement from '../../../../elements/MessageBindings.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type MessageBindingsVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MessageBindingsVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MessageBindingsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'MessageBindings']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: MessageBindingsVisitorOptions) {
    super(options);
    this.element = new MessageBindingsElement();
    this.specPath = always(['document', 'objects', 'MessageBindings']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default MessageBindingsVisitor;
