import { always } from 'ramda';

import SchemaElement from '../../../../elements/Schema.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseFixedFieldsVisitorOptions as SchemaVisitorOptions };

/**
 * @public
 */
class SchemaVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: SchemaElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Schema']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new SchemaElement();
    this.specPath = always(['document', 'objects', 'Schema']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default SchemaVisitor;
