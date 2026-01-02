import { always } from 'ramda';

import SwaggerElement from '../../../elements/Swagger.ts';
import { SpecPath } from '../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from './bases.ts';

export type { BaseFixedFieldsVisitorOptions as SwaggerVisitorOptions };

/**
 * @public
 */
class SwaggerVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SwaggerElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Swagger']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new SwaggerElement();
    this.specPath = always(['document', 'objects', 'Swagger']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default SwaggerVisitor;
