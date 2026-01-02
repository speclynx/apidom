import { MemberElement, Element, ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';
import { BREAK, cloneDeep, toValue } from '@speclynx/apidom-core';

import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';

/**
 * @public
 */
export type SpecPath<T = string[]> = (element: unknown) => T;

/**
 * @public
 */
export interface FixedFieldsVisitorOptions extends SpecificationVisitorOptions {
  readonly specPath: SpecPath;
  readonly ignoredFields?: string[];
}

/**
 * @public
 */
class FixedFieldsVisitor extends SpecificationVisitor {
  protected specPath: SpecPath;

  protected ignoredFields: string[];

  constructor({ specPath, ignoredFields, ...rest }: FixedFieldsVisitorOptions) {
    super({ ...rest });
    this.specPath = specPath;
    this.ignoredFields = ignoredFields || [];
  }

  ObjectElement(objectElement: ObjectElement) {
    const specPath = this.specPath(objectElement);
    const fields = this.retrieveFixedFields(specPath);

    // @ts-ignore
    objectElement.forEach((value: Element, key: Element, memberElement: MemberElement) => {
      const keyValue = toValue(key) as string;
      if (
        isStringElement(key) &&
        fields.includes(keyValue) &&
        !this.ignoredFields.includes(keyValue)
      ) {
        const fixedFieldElement = this.toRefractedElement(
          [...specPath, 'fixedFields', keyValue],
          value,
        );
        const newMemberElement = new MemberElement(cloneDeep(key), fixedFieldElement);
        this.copyMetaAndAttributes(memberElement, newMemberElement);
        newMemberElement.classes.push('fixed-field');
        (this.element.content as Element[]).push(newMemberElement);
      } else if (!this.ignoredFields.includes(keyValue)) {
        (this.element.content as Element[]).push(cloneDeep(memberElement));
      }
    });

    this.copyMetaAndAttributes(objectElement, this.element);

    return BREAK;
  }
}

export default FixedFieldsVisitor;
