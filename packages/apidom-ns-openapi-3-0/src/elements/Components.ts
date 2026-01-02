import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class Components extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'components';
  }

  get schemas(): ObjectElement | undefined {
    return this.get('schemas') as ObjectElement | undefined;
  }

  set schemas(schemas: ObjectElement | undefined) {
    this.set('schemas', schemas);
  }

  get responses(): ObjectElement | undefined {
    return this.get('responses') as ObjectElement | undefined;
  }

  set responses(responses: ObjectElement | undefined) {
    this.set('responses', responses);
  }

  get parameters(): ObjectElement | undefined {
    return this.get('parameters') as ObjectElement | undefined;
  }

  set parameters(parameters: ObjectElement | undefined) {
    this.set('parameters', parameters);
  }

  get examples(): ObjectElement | undefined {
    return this.get('examples') as ObjectElement | undefined;
  }

  set examples(examples: ObjectElement | undefined) {
    this.set('examples', examples);
  }

  get requestBodies(): ObjectElement | undefined {
    return this.get('requestBodies') as ObjectElement | undefined;
  }

  set requestBodies(requestBodies: ObjectElement | undefined) {
    this.set('requestBodies', requestBodies);
  }

  get headers(): ObjectElement | undefined {
    return this.get('headers') as ObjectElement | undefined;
  }

  set headers(headers: ObjectElement | undefined) {
    this.set('headers', headers);
  }

  get securitySchemes(): ObjectElement | undefined {
    return this.get('securitySchemes') as ObjectElement | undefined;
  }

  set securitySchemes(securitySchemes: ObjectElement | undefined) {
    this.set('securitySchemes', securitySchemes);
  }

  get linksField(): ObjectElement | undefined {
    return this.get('links') as ObjectElement | undefined;
  }

  set linksField(links: ObjectElement | undefined) {
    this.set('links', links);
  }

  get callbacks(): ObjectElement | undefined {
    return this.get('callbacks') as ObjectElement | undefined;
  }

  set callbacks(callbacks: ObjectElement | undefined) {
    this.set('callbacks', callbacks);
  }
}

export default Components;
