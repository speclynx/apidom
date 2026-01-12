import { ArrayElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SwaggerSchemesElement from '../../../elements/nces/SwaggerSchemes.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as SchemesVisitorOptions };

/**
 * @public
 */
class SchemesVisitor extends FallbackVisitor {
  declare public element: SwaggerSchemesElement;

  constructor(options: FallbackVisitorOptions) {
    super(options);
    this.element = new SwaggerSchemesElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    this.element = this.element.concat(cloneDeep(arrayElement));

    path.stop();
  }
}

export default SchemesVisitor;
