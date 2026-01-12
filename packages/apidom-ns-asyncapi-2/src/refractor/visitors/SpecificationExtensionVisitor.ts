import { MemberElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SpecificationVisitor, { SpecificationVisitorOptions } from './SpecificationVisitor.ts';

export type { SpecificationVisitorOptions as SpecificationExtensionVisitorOptions };

/**
 * @public
 */
class SpecificationExtensionVisitor extends SpecificationVisitor {
  declare public element: MemberElement;

  MemberElement(path: Path<MemberElement>) {
    const memberElement = path.node;

    this.element = cloneDeep(memberElement);
    this.element.classes.push('specification-extension');

    path.stop();
  }
}

export default SpecificationExtensionVisitor;
