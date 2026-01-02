import { always } from 'ramda';

import ServerElement from '../../../../elements/Server.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as ServerVisitorOptions };

/**
 * @public
 */
class ServerVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ServerElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Server']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ServerElement();
    this.specPath = always(['document', 'objects', 'Server']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ServerVisitor;
