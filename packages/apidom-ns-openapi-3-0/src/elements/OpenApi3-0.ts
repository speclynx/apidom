import {
  ObjectElement,
  ArrayElement,
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

class OpenApi3_0 extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'openApi3_0';
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
}

export default OpenApi3_0;
