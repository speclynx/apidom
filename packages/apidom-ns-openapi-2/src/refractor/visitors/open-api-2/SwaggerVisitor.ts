import { StringElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import SwaggerVersionElement from '../../../elements/SwaggerVersion.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

export type { BaseSpecificationVisitorOptions as SwaggerVisitorOptions };

/**
 * @public
 */
class SwaggerVisitor extends BaseSpecificationVisitor {
  declare public element: SwaggerVersionElement;

  StringElement(stringElement: StringElement) {
    const swaggerVersionElement = new SwaggerVersionElement(
      toValue(stringElement) as string | undefined,
    );

    this.copyMetaAndAttributes(stringElement, swaggerVersionElement);

    this.element = swaggerVersionElement;
    return BREAK;
  }
}

export default SwaggerVisitor;
