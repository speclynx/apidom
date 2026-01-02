import {
  ObjectElement,
  ArrayElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import SwaggerVersionElement from './SwaggerVersion.ts';
import InfoElement from './Info.ts';
import PathsElement from './Paths.ts';
import DefinitionsElement from './Definitions.ts';
import ParametersDefinitionsElement from './ParametersDefinitions.ts';
import ResponsesDefinitionsElement from './ResponsesDefinitions.ts';
import SecurityDefinitionsElement from './SecurityDefinitions.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';

/**
 * @public
 */
class Swagger extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'swagger';
    this.classes.push('api');
  }

  get swagger(): SwaggerVersionElement | undefined {
    return this.get('swagger') as SwaggerVersionElement | undefined;
  }

  set swagger(swagger: SwaggerVersionElement | undefined) {
    this.set('swagger', swagger);
  }

  get info(): InfoElement | undefined {
    return this.get('info') as InfoElement | undefined;
  }

  set info(info: InfoElement | undefined) {
    this.set('info', info);
  }

  get host(): StringElement | undefined {
    return this.get('host') as StringElement | undefined;
  }

  set host(host: StringElement | undefined) {
    this.set('host', host);
  }

  get basePath(): StringElement | undefined {
    return this.get('basePath') as StringElement | undefined;
  }

  set basePath(basePath: StringElement | undefined) {
    this.set('basePath', basePath);
  }

  get schemes(): ArrayElement | undefined {
    return this.get('schemes') as ArrayElement | undefined;
  }

  set schemes(schemes: ArrayElement | undefined) {
    this.set('schemes', schemes);
  }

  get consumes(): ArrayElement | undefined {
    return this.get('consumes') as ArrayElement | undefined;
  }

  set consumes(consumes: ArrayElement | undefined) {
    this.set('consumes', consumes);
  }

  get produces(): ArrayElement | undefined {
    return this.get('produces') as ArrayElement | undefined;
  }

  set produces(produces: ArrayElement | undefined) {
    this.set('produces', produces);
  }

  get paths(): PathsElement | undefined {
    return this.get('paths') as PathsElement | undefined;
  }

  set paths(paths: PathsElement | undefined) {
    this.set('paths', paths);
  }

  get definitions(): DefinitionsElement | undefined {
    return this.get('definitions') as DefinitionsElement | undefined;
  }

  set definitions(definitions: DefinitionsElement | undefined) {
    this.set('definitions', definitions);
  }

  get parameters(): ParametersDefinitionsElement | undefined {
    return this.get('parameters') as ParametersDefinitionsElement | undefined;
  }

  set parameters(parameters: ParametersDefinitionsElement | undefined) {
    this.set('parameters', parameters);
  }

  get responses(): ResponsesDefinitionsElement | undefined {
    return this.get('responses') as ResponsesDefinitionsElement | undefined;
  }

  set responses(responses: ResponsesDefinitionsElement | undefined) {
    this.set('responses', responses);
  }

  get securityDefinitions(): SecurityDefinitionsElement | undefined {
    return this.get('securityDefinitions') as SecurityDefinitionsElement | undefined;
  }

  set securityDefinitions(securityDefinitions: SecurityDefinitionsElement | undefined) {
    this.set('securityDefinitions', securityDefinitions);
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

export default Swagger;
