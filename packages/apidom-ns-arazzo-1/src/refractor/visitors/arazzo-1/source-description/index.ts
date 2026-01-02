import { always } from 'ramda';

import SourceDescriptionElement from '../../../../elements/SourceDescription.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface SourceDescriptionVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class SourceDescriptionVisitor extends BaseFixedFieldsFallbackVisitor {
  declare public readonly element: SourceDescriptionElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'SourceDescription']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: SourceDescriptionVisitorOptions) {
    super(options);
    this.element = new SourceDescriptionElement();
    this.specPath = always(['document', 'objects', 'SourceDescription']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default SourceDescriptionVisitor;
