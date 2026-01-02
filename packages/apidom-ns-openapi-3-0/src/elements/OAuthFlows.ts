import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

import OAuthFlowElement from './OAuthFlow.ts';

/**
 * @public
 */
class OAuthFlows extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'oAuthFlows';
  }

  get implicit(): OAuthFlowElement | undefined {
    return this.get('implicit') as OAuthFlowElement | undefined;
  }

  set implicit(implicit: OAuthFlowElement | undefined) {
    this.set('implicit', implicit);
  }

  get password(): OAuthFlowElement | undefined {
    return this.get('password') as OAuthFlowElement | undefined;
  }

  set password(password: OAuthFlowElement | undefined) {
    this.set('password', password);
  }

  get clientCredentials(): OAuthFlowElement | undefined {
    return this.get('clientCredentials') as OAuthFlowElement | undefined;
  }

  set clientCredentials(clientCredentials: OAuthFlowElement | undefined) {
    this.set('clientCredentials', clientCredentials);
  }

  get authorizationCode(): OAuthFlowElement | undefined {
    return this.get('authorizationCode') as OAuthFlowElement | undefined;
  }

  set authorizationCode(authorizationCode: OAuthFlowElement | undefined) {
    this.set('authorizationCode', authorizationCode);
  }
}

export default OAuthFlows;
