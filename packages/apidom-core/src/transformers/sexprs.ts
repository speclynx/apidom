import { Element } from '@speclynx/apidom-datamodel';
import { traverse, type Path } from '@speclynx/apidom-traverse';

/**
 * Transforms ApiDOM into S-expressions (Symbolic Expressions).
 * @public
 */
const sexprs = (element: Element): string => {
  let result = '';
  let nestingLevel = 0;

  traverse(element, {
    enter(path: Path<Element>) {
      const { element: elementName } = path.node;
      const capitalizedElementName = elementName.charAt(0).toUpperCase() + elementName.slice(1);
      const indent = '  '.repeat(nestingLevel);
      result += nestingLevel > 0 ? '\n' : '';
      result += `${indent}(${capitalizedElementName}Element`;
      nestingLevel += 1;
    },
    leave() {
      nestingLevel -= 1;
      result += ')';
    },
  });

  return result;
};

export default sexprs;
