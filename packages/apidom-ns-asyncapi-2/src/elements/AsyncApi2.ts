import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

import AsyncApiVersionElement from './AsyncApiVersion.ts';
import DefaultContentTypeElement from './DefaultContentType.ts';
import IdentifierElement from './Identifier.ts';
import ComponentsElement from './Components.ts';
import InfoElement from './Info.ts';
import ChannelsElement from './Channels.ts';
import ServersElement from './Servers.ts';
import TagsElement from './Tags.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';

/**
 * @public
 */
class AsyncApi2 extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'asyncApi2';
    this.classes.push('api');
  }

  get asyncapi(): AsyncApiVersionElement | undefined {
    return this.get('asyncapi') as AsyncApiVersionElement | undefined;
  }

  set asyncapi(asyncapi: AsyncApiVersionElement | undefined) {
    this.set('asyncapi', asyncapi);
  }

  get idField(): IdentifierElement | undefined {
    return this.get('id') as IdentifierElement | undefined;
  }

  set idField(id: IdentifierElement | undefined) {
    this.set('id', id);
  }

  get info(): InfoElement | undefined {
    return this.get('info') as InfoElement | undefined;
  }

  set info(info: InfoElement | undefined) {
    this.set('info', info);
  }

  get servers(): ServersElement | undefined {
    return this.get('servers') as ServersElement | undefined;
  }

  set servers(servers: ServersElement | undefined) {
    this.set('servers', servers);
  }

  get defaultContentType(): DefaultContentTypeElement | undefined {
    return this.get('defaultContentType') as DefaultContentTypeElement | undefined;
  }

  set defaultContentType(defaultContentType: DefaultContentTypeElement | undefined) {
    this.set('defaultContentType', defaultContentType);
  }

  get channels(): ChannelsElement | undefined {
    return this.get('channels') as ChannelsElement | undefined;
  }

  set channels(channels: ChannelsElement | undefined) {
    this.set('channels', channels);
  }

  get components(): ComponentsElement | undefined {
    return this.get('components') as ComponentsElement | undefined;
  }

  set components(components: ComponentsElement | undefined) {
    this.set('components', components);
  }

  get tags(): TagsElement | undefined {
    return this.get('tags') as TagsElement | undefined;
  }

  set tags(tags: TagsElement | undefined) {
    this.set('tags', tags);
  }

  get externalDocs(): ExternalDocumentationElement | undefined {
    return this.get('externalDocs') as ExternalDocumentationElement | undefined;
  }

  set externalDocs(externalDocs: ExternalDocumentationElement | undefined) {
    this.set('externalDocs', externalDocs);
  }
}

export default AsyncApi2;
