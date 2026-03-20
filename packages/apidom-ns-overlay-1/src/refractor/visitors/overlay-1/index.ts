import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { SpecPath } from '../generics/FixedFieldsVisitor.ts';
import FixedFieldsVisitor from '../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsFallbackVisitor, BaseFixedFieldsFallbackVisitorOptions } from './bases.ts';
import Overlay1Element from '../../../elements/Overlay1.ts';

/**
 * @public
 */
export interface OverlayVisitorOptions extends BaseFixedFieldsFallbackVisitorOptions {}

/**
 * @public
 */
class OverlayVisitor extends BaseFixedFieldsFallbackVisitor {
  public readonly element: Overlay1Element;

  protected readonly specPath: SpecPath<['document', 'objects', 'Overlay']>;

  protected readonly canSupportSpecificationExtensions: true;

  constructor(options: OverlayVisitorOptions) {
    super(options);
    this.element = new Overlay1Element();
    this.consumeSafe = true;
    this.specPath = always(['document', 'objects', 'Overlay']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(path: Path<ObjectElement>) {
    return FixedFieldsVisitor.prototype.ObjectElement.call(this, path);
  }
}

export default OverlayVisitor;
