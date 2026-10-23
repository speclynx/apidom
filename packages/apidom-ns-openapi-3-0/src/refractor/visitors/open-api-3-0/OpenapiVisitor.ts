import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';
import OpenapiElement from '../../../elements/Openapi.ts';

/**
 * @public
 */
export type { BaseSpecificationVisitorOptions as OpenapiVisitorOptions };

/**
 * @public
 */
class OpenapiVisitor extends BaseSpecificationVisitor {
  declare public element: OpenapiElement;

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const openapiElement = new OpenapiElement(stringElement.toValue() as string | undefined);

    this.copyMetaAndAttributes(stringElement, openapiElement);

    this.element = openapiElement;
    path.stop();
  }
}

export default OpenapiVisitor;
