import { always, range } from 'ramda';
import { Element, ObjectElement, StringElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

import ReferenceElement from '../../../../elements/Reference.ts';
import ResponsesElement from '../../../../elements/Responses.ts';
import { SpecPath } from '../../generics/MixedFieldsVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement, isResponseElement } from '../../../../predicates.ts';
import { BaseMixedFieldsVisitor, BaseMixedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseMixedFieldsVisitorOptions as ResponsesVisitorOptions };

/**
 * @public
 */
class ResponsesVisitor extends BaseMixedFieldsVisitor {
  declare public readonly element: ResponsesElement;

  declare protected readonly specPathFixedFields: SpecPath<['document', 'objects', 'Responses']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  declare protected readonly specPathPatternedFields: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Response']
  >;

  constructor(options: BaseMixedFieldsVisitorOptions) {
    super(options);
    this.element = new ResponsesElement();
    this.specPathFixedFields = always(['document', 'objects', 'Responses']);
    this.canSupportSpecificationExtensions = true;
    this.specPathPatternedFields = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Response'];
    this.fieldPatternPredicate = (value) =>
      new RegExp(`^(1XX|2XX|3XX|4XX|5XX|${range(100, 600).join('|')})$`).test(String(value));
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseMixedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // decorate every ReferenceElement with metadata about their referencing type
    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'response');
    });

    // decorate every ResponseElement with metadata about their status code
    // @ts-ignore
    this.element.filter(isResponseElement).forEach((value: Element, key: StringElement) => {
      const httpStatusCode = cloneDeep(key);
      if (!this.fieldPatternPredicate(toValue(httpStatusCode))) return;
      value.meta.set('http-status-code', httpStatusCode);
    });
  }
}

export default ResponsesVisitor;
