import { always } from 'ramda';
import { ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';

import JSONReferenceElement from '../../../../elements/JSONReference.ts';
import FixedFieldsVisitor, { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { FixedFieldsVisitorOptions } from '../../generics/FixedFieldsVisitor.ts';
import { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import { JSONReferenceVisitorBase } from '../bases.ts';

/**
 * @public
 */
export interface JSONReferenceVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class JSONReferenceVisitor extends JSONReferenceVisitorBase {
  declare public readonly element: JSONReferenceElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'JSONReference']>;

  constructor(options: JSONReferenceVisitorOptions) {
    super(options);
    this.element = new JSONReferenceElement();
    this.specPath = always(['document', 'objects', 'JSONReference']);
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = FixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

    // mark this JSONReferenceElement with reference metadata
    if (isStringElement(this.element.$ref)) {
      this.element.classes.push('reference-element');
    }

    return result;
  }
}

export default JSONReferenceVisitor;
