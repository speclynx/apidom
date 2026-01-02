import {
  ArrayElement,
  ObjectElement,
  StringElement,
  type Attributes,
  type Meta,
} from '@speclynx/apidom-datamodel';

import CorrelationIDElement from './CorrelationID.ts';
import ExternalDocumentationElement from './ExternalDocumentation.ts';
import MessageBindingsElement from './MessageBindings.ts';
import ReferenceElement from './Reference.ts';
import SchemaElement from './Schema.ts';
import TagsElement from './Tags.ts';

/**
 * @public
 */
class MessageTrait extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'messageTrait';
  }

  get messageId(): StringElement | undefined {
    return this.get('messageId') as StringElement | undefined;
  }

  set messageId(messageId: StringElement | undefined) {
    this.set('messageId', messageId);
  }

  get headers(): SchemaElement | ReferenceElement | undefined {
    return this.get('headers') as SchemaElement | ReferenceElement | undefined;
  }

  set headers(headers: SchemaElement | ReferenceElement | undefined) {
    this.set('headers', headers);
  }

  get correlationId(): CorrelationIDElement | ReferenceElement | undefined {
    return this.get('correlationId') as CorrelationIDElement | ReferenceElement | undefined;
  }

  set correlationId(correlationId: CorrelationIDElement | ReferenceElement | undefined) {
    this.set('correlationId', correlationId);
  }

  get schemaFormat(): StringElement | undefined {
    return this.get('schemaFormat') as StringElement | undefined;
  }

  set schemaFormat(schemaFormat: StringElement | undefined) {
    this.set('schemaFormat', schemaFormat);
  }

  get contentType(): StringElement | undefined {
    return this.get('contentType') as StringElement | undefined;
  }

  set contentType(contentType: StringElement | undefined) {
    this.set('contentType', contentType);
  }

  get name(): StringElement | undefined {
    return this.get('name') as StringElement | undefined;
  }

  set name(name: StringElement | undefined) {
    this.set('name', name);
  }

  get title(): StringElement | undefined {
    return this.get('title') as StringElement | undefined;
  }

  set title(title: StringElement | undefined) {
    this.set('title', title);
  }

  get summary(): StringElement | undefined {
    return this.get('summary') as StringElement | undefined;
  }

  set summary(summary: StringElement | undefined) {
    this.set('summary', summary);
  }

  get description(): StringElement | undefined {
    return this.get('description') as StringElement | undefined;
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
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

  get bindings(): MessageBindingsElement | ReferenceElement | undefined {
    return this.get('bindings') as MessageBindingsElement | ReferenceElement | undefined;
  }

  set bindings(bindings: MessageBindingsElement | ReferenceElement | undefined) {
    this.set('bindings', bindings);
  }

  get examples(): ArrayElement | undefined {
    return this.get('examples') as ArrayElement | undefined;
  }

  set examples(examples: ArrayElement | undefined) {
    this.set('examples', examples);
  }
}

export default MessageTrait;
