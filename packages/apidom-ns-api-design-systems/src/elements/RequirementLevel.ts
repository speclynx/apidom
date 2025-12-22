import { StringElement, Attributes, Meta } from '@speclynx/apidom-core';

/**
 * @public
 */
class RequirementLevel extends StringElement {
  constructor(content?: string, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'requirementLevel';
  }
}

export default RequirementLevel;
