import { difference } from 'ramda';
import { ObjectElement, MemberElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import FixedFieldsVisitor, { SpecPath } from './FixedFieldsVisitor.ts';
import PatternedFieldsVisitor from './PatternedFieldsVisitor.ts';
import { BaseMixedFieldsVisitor, BaseMixedFieldsVisitorOptions } from '../async-api-2/bases.ts';

export type { SpecPath };

/**
 * @public
 */
export interface MixedFieldsVisitorOptions extends BaseMixedFieldsVisitorOptions {
  readonly specPathFixedFields: SpecPath;
  readonly specPathPatternedFields: SpecPath;
}

/**
 * @public
 */
class MixedFieldsVisitor extends BaseMixedFieldsVisitor {
  protected specPathFixedFields: SpecPath;

  protected specPathPatternedFields: SpecPath;

  constructor({
    specPathFixedFields,
    specPathPatternedFields,
    ...rest
  }: MixedFieldsVisitorOptions) {
    super({ ...rest });
    this.specPathFixedFields = specPathFixedFields;
    this.specPathPatternedFields = specPathPatternedFields;
  }

  ObjectElement(objectElement: ObjectElement) {
    const { specPath, ignoredFields } = this;

    try {
      this.specPath = this.specPathFixedFields;
      const fixedFields = this.retrieveFixedFields(this.specPath(objectElement));
      // let FixedFieldsVisitor only process fixed fields and leave rest to PatternedFieldsVisitor
      // @ts-ignore
      this.ignoredFields = [...ignoredFields, ...difference(objectElement.keys(), fixedFields)];
      FixedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

      this.specPath = this.specPathPatternedFields;
      this.ignoredFields = fixedFields;
      PatternedFieldsVisitor.prototype.ObjectElement.call(this, objectElement);

      // reorder this.element members by original objectElement keys
      const objectElementKeys = objectElement.keys() as string[];
      (this.element.content as MemberElement[]).sort((a: MemberElement, b: MemberElement) => {
        return (
          objectElementKeys.indexOf(toValue(a.key) as string) -
          objectElementKeys.indexOf(toValue(b.key) as string)
        );
      });
    } catch (e) {
      this.specPath = specPath;
      throw e;
    }

    return BREAK;
  }
}

export default MixedFieldsVisitor;
