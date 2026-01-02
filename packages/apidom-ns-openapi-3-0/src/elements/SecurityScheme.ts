import {
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import OAuthFlowsElement from './OAuthFlows.ts';

/**
 * @public
 */
class SecurityScheme extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'securityScheme';
  }

  get type(): StringElement | undefined {
    return this.get('type') as StringElement | undefined;
  }

  set type(type: StringElement | undefined) {
    this.set('type', type);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get in(): StringElement | undefined {
    return this.get('in') as StringElement | undefined;
  }

  set in(inVal: StringElement | undefined) {
    this.set('in', inVal);
  }

  get scheme(): StringElement | undefined {
    return this.get('scheme') as StringElement | undefined;
  }

  set scheme(scheme: StringElement | undefined) {
    this.set('scheme', scheme);
  }

  get bearerFormat(): StringElement | undefined {
    return this.get('bearerFormat') as StringElement | undefined;
  }

  set bearerFormat(bearerFormat: StringElement | undefined) {
    this.set('bearerFormat', bearerFormat);
  }

  get flows(): OAuthFlowsElement | undefined {
    return this.get('flows') as OAuthFlowsElement | undefined;
  }

  set flows(flows: OAuthFlowsElement | undefined) {
    this.set('flows', flows);
  }

  get openIdConnectUrl(): StringElement | undefined {
    return this.get('openIdConnectUrl') as StringElement | undefined;
  }

  set openIdConnectUrl(openIdConnectUrl: StringElement | undefined) {
    this.set('openIdConnectUrl', openIdConnectUrl);
  }
}

export default SecurityScheme;
