import { always } from 'ramda';

import ServerVariableElement from '../../../../elements/ServerVariable.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as ServerVariableVisitorOptions };

/**
 * @public
 */
class ServerVariableVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ServerVariableElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ServerVariable']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ServerVariableElement();
    this.specPath = always(['document', 'objects', 'ServerVariable']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ServerVariableVisitor;
