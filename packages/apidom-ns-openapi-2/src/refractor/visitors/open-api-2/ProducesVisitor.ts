import { ArrayElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SwaggerProducesElement from '../../../elements/nces/SwaggerProduces.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';

export type { FallbackVisitorOptions as ProducesVisitorOptions };

/**
 * @public
 */
class ProducesVisitor extends FallbackVisitor {
  declare public element: SwaggerProducesElement;

  constructor(options: FallbackVisitorOptions) {
    super(options);
    this.element = new SwaggerProducesElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    this.element = this.element.concat(cloneDeep(arrayElement));

    path.stop();
  }
}

export default ProducesVisitor;
