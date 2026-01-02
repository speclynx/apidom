import { always } from 'ramda';

import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';
import type { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import ServerBindingsElement from '../../../../elements/ServerBindings.ts';

/**
 * @public
 */
export type ServerBindingsVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class ServerBindingsVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ServerBindingsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ServerBindings']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ServerBindingsVisitorOptions) {
    super(options);
    this.element = new ServerBindingsElement();
    this.specPath = always(['document', 'objects', 'ServerBindings']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ServerBindingsVisitor;
