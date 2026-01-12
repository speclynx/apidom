import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  BaseSchemaArrayVisitor,
  BaseSchemaArrayVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2019-09';

/**
 * @public
 */
export type PrefixItemsVisitorOptions = BaseSchemaArrayVisitorOptions;

/**
 * @public
 */
class PrefixItemsVisitor extends BaseSchemaArrayVisitor {
  declare public readonly element: ArrayElement;

  constructor(options: PrefixItemsVisitorOptions) {
    super(options);
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-prefixItems');
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

export default PrefixItemsVisitor;
