import {
  MemberElement,
  Element,
  ObjectElement,
  isStringElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { toValue } from '@speclynx/apidom-core';

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

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;
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

    path.stop();
  }
}

export default FixedFieldsVisitor;
