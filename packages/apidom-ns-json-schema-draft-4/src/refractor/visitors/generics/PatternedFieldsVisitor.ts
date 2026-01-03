import { F as stubFalse } from 'ramda';
import { ObjectElement, Element, MemberElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import { SpecPath } from './FixedFieldsVisitor.ts';

export type { SpecPath };

/**
 * @public
 */
export interface PatternedFieldsVisitorOptions extends SpecificationVisitorOptions {
  readonly specPath: SpecPath;
  readonly ignoredFields?: string[];
  readonly fieldPatternPredicate?: (...args: unknown[]) => boolean;
}

/**
 * @public
 */
class PatternedFieldsVisitor extends SpecificationVisitor {
  protected specPath: SpecPath;

  protected ignoredFields: string[];

  protected fieldPatternPredicate: (value: unknown) => boolean = stubFalse;

  constructor({
    specPath,
    ignoredFields,
    fieldPatternPredicate,
    ...rest
  }: PatternedFieldsVisitorOptions) {
    super({ ...rest });
    this.specPath = specPath;
    this.ignoredFields = ignoredFields || [];

    if (typeof fieldPatternPredicate === 'function') {
      this.fieldPatternPredicate = fieldPatternPredicate;
    }
  }

  ObjectElement(objectElement: ObjectElement) {
    // @ts-ignore
    objectElement.forEach((value: Element, key: Element, memberElement: MemberElement) => {
      const keyValue = toValue(key) as string;
      if (!this.ignoredFields.includes(keyValue) && this.fieldPatternPredicate(keyValue)) {
        const specPath = this.specPath(value);
        const patternedFieldElement = this.toRefractedElement(specPath, value);
        const newMemberElement = new MemberElement(cloneDeep(key), patternedFieldElement);
        this.copyMetaAndAttributes(memberElement, newMemberElement);
        newMemberElement.classes.push('patterned-field');
        (this.element.content as Element[]).push(newMemberElement);
      } else if (!this.ignoredFields.includes(keyValue)) {
        (this.element.content as Element[]).push(cloneDeep(memberElement));
      }
    });

    this.copyMetaAndAttributes(objectElement, this.element);

    return BREAK;
  }
}

export default PatternedFieldsVisitor;
