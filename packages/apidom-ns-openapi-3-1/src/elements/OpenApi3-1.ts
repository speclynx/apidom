import {
  ObjectElement,
  ArrayElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import OpenapiElement from './Openapi.ts';
import InfoElement from './Info.ts';
import ComponentsElement from './Components.ts';
import PathsElement from './Paths.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';

/**
 * @public
 */

class OpenApi3_1 extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'openApi3_1';
    this.classes.push('api');
  }

  get openapi(): OpenapiElement | undefined {
    return this.get('openapi') as OpenapiElement | undefined;
  }

  set openapi(openapi: OpenapiElement | undefined) {
    this.set('openapi', openapi);
  }

  get info(): InfoElement | undefined {
    return this.get('info') as InfoElement | undefined;
  }

  set info(info: InfoElement | undefined) {
    this.set('info', info);
  }

  get jsonSchemaDialect(): StringElement | undefined {
    return this.get('jsonSchemaDialect') as StringElement | undefined;
  }

  set jsonSchemaDialect(jsonSchemaDialect: StringElement | undefined) {
    this.set('jsonSchemaDialect', jsonSchemaDialect);
  }

  get servers(): ArrayElement | undefined {
    return this.get('servers') as ArrayElement | undefined;
  }

  set servers(servers: ArrayElement | undefined) {
    this.set('servers', servers);
  }

  get paths(): PathsElement | undefined {
    return this.get('paths') as PathsElement | undefined;
  }

  set paths(paths: PathsElement | undefined) {
    this.set('paths', paths);
  }

  get components(): ComponentsElement | undefined {
    return this.get('components') as ComponentsElement | undefined;
  }

  set components(components: ComponentsElement | undefined) {
    this.set('components', components);
  }

  get security(): ArrayElement | undefined {
    return this.get('security') as ArrayElement | undefined;
  }

  set security(security: ArrayElement | undefined) {
    this.set('security', security);
  }

  get tags(): ArrayElement | undefined {
    return this.get('tags') as ArrayElement | undefined;
  }

  set tags(tags: ArrayElement | undefined) {
    this.set('tags', tags);
  }

  get externalDocs(): ExternalDocumentationElement | undefined {
    return this.get('externalDocs') as ExternalDocumentationElement | undefined;
  }

  set externalDocs(externalDocs: ExternalDocumentationElement | undefined) {
    this.set('externalDocs', externalDocs);
  }

  get webhooks(): ObjectElement | undefined {
    return this.get('webhooks') as ObjectElement | undefined;
  }

  set webhooks(webhooks: ObjectElement | undefined) {
    this.set('webhooks', webhooks);
  }
}

export default OpenApi3_1;
