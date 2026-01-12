import {
  isStringElement,
  MemberElement,
  Element,
  ObjectElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { toValue } from '@speclynx/apidom-core';

import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import { isArazzoSpecificationExtension } from '../../predicates.ts';

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
  readonly canSupportSpecificationExtensions?: boolean;
  readonly specificationExtensionPredicate?: typeof isArazzoSpecificationExtension;
}

/**
 * @public
 */
class FixedFieldsVisitor extends SpecificationVisitor {
  protected specPath: SpecPath;

  protected ignoredFields: string[];

  protected canSupportSpecificationExtensions: boolean = true;

  protected specificationExtensionPredicate = isArazzoSpecificationExtension;

  constructor({
    specPath,
    ignoredFields,
    canSupportSpecificationExtensions,
    specificationExtensionPredicate,
    ...rest
  }: FixedFieldsVisitorOptions) {
    super({ ...rest });
    this.specPath = specPath;
    this.ignoredFields = ignoredFields || [];

    if (typeof canSupportSpecificationExtensions === 'boolean') {
      this.canSupportSpecificationExtensions = canSupportSpecificationExtensions;
    }
    if (typeof specificationExtensionPredicate === 'function') {
      this.specificationExtensionPredicate = specificationExtensionPredicate;
    }
  }

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;
    const specPath = this.specPath(objectElement);
    const fields = this.retrieveFixedFields(specPath);

    // @ts-ignore
    objectElement.forEach((value: Element, key: Element, memberElement: MemberElement) => {
      if (
        isStringElement(key) &&
        fields.includes(toValue(key) as string) &&
        !this.ignoredFields.includes(toValue(key) as string)
      ) {
        const fixedFieldElement = this.toRefractedElement(
          [...specPath, 'fixedFields', toValue(key) as string],
          value,
        );
        const newMemberElement = new MemberElement(cloneDeep(key), fixedFieldElement);
        this.copyMetaAndAttributes(memberElement, newMemberElement);
        newMemberElement.classes.push('fixed-field');
        (this.element as ObjectElement).push(newMemberElement);
      } else if (
        this.canSupportSpecificationExtensions &&
        this.specificationExtensionPredicate(memberElement)
      ) {
        const extensionElement = this.toRefractedElement(['document', 'extension'], memberElement);
        (this.element as ObjectElement).push(extensionElement);
      } else if (!this.ignoredFields.includes(toValue(key) as string)) {
        (this.element as ObjectElement).push(cloneDeep(memberElement));
      }
    });

    this.copyMetaAndAttributes(objectElement, this.element);

    path.stop();
  }
}

export default FixedFieldsVisitor;
