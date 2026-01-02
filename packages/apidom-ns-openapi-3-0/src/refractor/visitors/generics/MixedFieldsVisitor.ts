import { Mixin } from 'ts-mixer';
import { difference } from 'ramda';
import { ObjectElement, MemberElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import FixedFieldsVisitor, { SpecPath } from './FixedFieldsVisitor.ts';
import PatternedFieldsVisitor, { PatternedFieldsVisitorOptions } from './PatternedFieldsVisitor.ts';

export type { SpecPath };

/**
 * @public
 */
export interface MixedFieldsVisitorOptions extends PatternedFieldsVisitorOptions {
  readonly specPathFixedFields: SpecPath;
  readonly specPathPatternedFields: SpecPath;
}

/**
 * Base class for MixedFieldsVisitor combining FixedFieldsVisitor and PatternedFieldsVisitor.
 * @public
 */
export const MixedFieldsVisitorBase = Mixin(FixedFieldsVisitor, PatternedFieldsVisitor);

/**
 * @public
 */
class MixedFieldsVisitor extends MixedFieldsVisitorBase {
  protected readonly specPathFixedFields: SpecPath;

  protected readonly specPathPatternedFields: SpecPath;

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
      (this.element.content as Element[]).sort((a: unknown, b: unknown) => {
        return (
          objectElementKeys.indexOf(toValue((a as MemberElement).key) as string) -
          objectElementKeys.indexOf(toValue((b as MemberElement).key) as string)
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
