import { always } from 'ramda';

import ServerVariableElement from '../../../../elements/ServerVariable.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';
import type { SpecPath } from '../../generics/FixedFieldsVisitor.ts';

/**
 * @public
 */
export type ServerVariableVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class ServerVariableVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ServerVariableElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ServerVariable']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ServerVariableVisitorOptions) {
    super(options);
    this.element = new ServerVariableElement();
    this.specPath = always(['document', 'objects', 'ServerVariable']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ServerVariableVisitor;
