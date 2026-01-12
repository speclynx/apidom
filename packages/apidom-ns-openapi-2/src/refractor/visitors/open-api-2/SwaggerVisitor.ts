import { StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import SwaggerVersionElement from '../../../elements/SwaggerVersion.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

export type { BaseSpecificationVisitorOptions as SwaggerVisitorOptions };

/**
 * @public
 */
class SwaggerVisitor extends BaseSpecificationVisitor {
  declare public element: SwaggerVersionElement;

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const swaggerVersionElement = new SwaggerVersionElement(
      toValue(stringElement) as string | undefined,
    );

    this.copyMetaAndAttributes(stringElement, swaggerVersionElement);

    this.element = swaggerVersionElement;
    path.stop();
  }
}

export default SwaggerVisitor;
