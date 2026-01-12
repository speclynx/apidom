import { ArrayElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import OperationConsumesElement from '../../../../elements/nces/OperationConsumes.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

export type { FallbackVisitorOptions as ConsumesVisitorOptions };

/**
 * @public
 */
class ConsumesVisitor extends FallbackVisitor {
  declare public element: OperationConsumesElement;

  constructor(options: FallbackVisitorOptions) {
    super(options);
    this.element = new OperationConsumesElement();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    this.element = this.element.concat(cloneDeep(arrayElement));

    path.stop();
  }
}

export default ConsumesVisitor;
