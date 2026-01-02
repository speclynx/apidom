import {
  StringElement,
  ObjectElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class CriterionExpressionType extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'criterionExpressionType';
  }

  get type(): StringElement | undefined {
    return this.get('type') as StringElement | undefined;
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get version(): StringElement | undefined {
    return this.get('version') as StringElement | undefined;
  }

  set version(version: StringElement | undefined) {
    this.set('version', version);
  }
}

export default CriterionExpressionType;
