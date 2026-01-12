import { always } from 'ramda';
import {
  StringElement,
  ObjectElement,
  isStringElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import PathItemElement from '../../../../elements/PathItem.ts';
import OperationElement from '../../../../elements/Operation.ts';
import { isOperationElement } from '../../../../predicates.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as PathItemVisitorOptions };

/**
 * @public
 */
class PathItemVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: PathItemElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'PathItem']>;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new PathItemElement();
    this.specPath = always(['document', 'objects', 'PathItem']);
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // decorate Operation elements with HTTP method
    this.element
      .filter(isOperationElement)
      // @ts-ignore
      .forEach((operationElement: OperationElement, httpMethodElementCI: StringElement) => {
        const httpMethodElementCS = cloneDeep(httpMethodElementCI);
        httpMethodElementCS.content = (toValue(httpMethodElementCS) as string).toUpperCase();
        operationElement.meta.set('http-method', httpMethodElementCS);
      });

    // mark this PathItemElement with reference metadata
    if (isStringElement(this.element.$ref)) {
      this.element.classes.push('reference-element');
    }
  }
}

export default PathItemVisitor;
