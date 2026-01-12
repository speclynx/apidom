import { ArrayElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import OperationSchemesElement from '../../../../elements/nces/OperationSchemes.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

export type { FallbackVisitorOptions as SchemesVisitorOptions };

/**
 * @public
 */
class SchemesVisitor extends FallbackVisitor {
  declare public element: OperationSchemesElement;

  constructor(options: FallbackVisitorOptions) {
    super(options);
    this.element = new OperationSchemesElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    this.element = this.element.concat(cloneDeep(arrayElement));

    path.stop();
  }
}

export default SchemesVisitor;
