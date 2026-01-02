import { always } from 'ramda';

import ExternalDocumentationElement from '../../../../elements/ExternalDocumentation.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as ExternalDocumentationVisitorOptions };

/**
 * @public
 */
class ExternalDocumentationVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ExternalDocumentationElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ExternalDocumentation']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ExternalDocumentationElement();
    this.specPath = always(['document', 'objects', 'ExternalDocumentation']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ExternalDocumentationVisitor;
