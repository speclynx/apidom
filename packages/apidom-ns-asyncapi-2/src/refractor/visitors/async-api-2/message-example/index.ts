import { always } from 'ramda';

import MessageExampleElement from '../../../../elements/MessageExample.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type MessageExampleVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class MessageExampleVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: MessageExampleElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'MessageExample']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: MessageExampleVisitorOptions) {
    super(options);
    this.element = new MessageExampleElement();
    this.specPath = always(['document', 'objects', 'MessageExample']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default MessageExampleVisitor;
