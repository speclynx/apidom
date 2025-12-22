import { StringElement, ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class CriterionExpressionType extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'criterionExpressionType';
  }

  get type(): StringElement | undefined {
    return this.get('type');
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get version(): StringElement | undefined {
    return this.get('version');
  }

  set version(version: StringElement | undefined) {
    this.set('version', version);
  }
}

export default CriterionExpressionType;
