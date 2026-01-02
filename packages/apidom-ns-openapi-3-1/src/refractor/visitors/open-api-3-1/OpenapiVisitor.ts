import { StringElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

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

  StringElement(stringElement: StringElement) {
    const openapiElement = new OpenapiElement(toValue(stringElement) as string | undefined);

    this.copyMetaAndAttributes(stringElement, openapiElement);

    this.element = openapiElement;
    return BREAK;
  }
}

export default OpenapiVisitor;
