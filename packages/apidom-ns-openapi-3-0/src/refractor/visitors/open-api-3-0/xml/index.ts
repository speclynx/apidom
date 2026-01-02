import { always } from 'ramda';

import XmlElement from '../../../../elements/Xml.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as XmlVisitorOptions };

/**
 * @public
 */
class XmlVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: XmlElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'XML']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new XmlElement();
    this.specPath = always(['document', 'objects', 'XML']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default XmlVisitor;
