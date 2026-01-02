import { Element } from '@speclynx/apidom-datamodel';

import { PredicateVisitor, visit } from './visitor.ts';

/**
 * Finds all elements matching the predicate.
 * @public
 */
const filter = <T extends Element>(
  predicate: (element: Element) => boolean,
  element: T,
): Element[] => {
  const visitor = new PredicateVisitor({ predicate });

  visit(element, visitor);

  return visitor.result;
};

export default filter;
