import { always } from 'ramda';
import { ComponentsSchemasElement, SpecPath } from '@speclynx/apidom-ns-openapi-3-0';

import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface SchemasVisitorOptions extends BaseMapVisitorOptions {}

/**
 * @public
 */
class SchemasVisitor extends BaseMapVisitor {
  declare public readonly element: ComponentsSchemasElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Schema']>;

  constructor(options: SchemasVisitorOptions) {
    super(options);
    this.element = new ComponentsSchemasElement();
    this.specPath = always(['document', 'objects', 'Schema']);
  }
}

export default SchemasVisitor;
