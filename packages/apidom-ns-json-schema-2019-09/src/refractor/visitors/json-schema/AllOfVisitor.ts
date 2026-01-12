import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseSchemaArrayVisitor, BaseSchemaArrayVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type AllOfVisitorOptions = BaseSchemaArrayVisitorOptions;

/**
 * @public
 */
class AllOfVisitor extends BaseSchemaArrayVisitor {
  declare public readonly element: ArrayElement;

  constructor(options: AllOfVisitorOptions) {
    super(options);
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-allOf');
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;

    arrayElement.forEach((item: Element): void => {
      const element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default AllOfVisitor;
