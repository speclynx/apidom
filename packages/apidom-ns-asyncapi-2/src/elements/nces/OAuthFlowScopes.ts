import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class OAuthFlowScopes extends ObjectElement {
  static primaryClass = 'oauth-flow-scopes';

  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(OAuthFlowScopes.primaryClass);
  }
}

export default OAuthFlowScopes;
