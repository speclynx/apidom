import {
  ObjectElement,
  ArrayElement,
  StringElement,
  NumberElement,
  BooleanElement,
  Attributes,
  Meta,
} from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class PulsarChannelBinding extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'pulsarChannelBinding';
    this.classes.push('channel-binding');
  }

  get namespace(): StringElement | undefined {
    return this.get('namespace') as StringElement | undefined;
  }

  set namespace(namespace: StringElement | undefined) {
    this.set('namespace', namespace);
  }

  get persistence(): StringElement | undefined {
    return this.get('persistence') as StringElement | undefined;
  }

  set persistence(persistence: StringElement | undefined) {
    this.set('persistence', persistence);
  }

  get compaction(): NumberElement | undefined {
    return this.get('compaction') as NumberElement | undefined;
  }

  set compaction(compaction: NumberElement | undefined) {
    this.set('compaction', compaction);
  }

  get ['geo-replication'](): ArrayElement | undefined {
    return this.get('geo-replication') as ArrayElement | undefined;
  }

  set ['geo-replication'](geoReplication: ArrayElement | undefined) {
    this.set('geo-replication', geoReplication);
  }

  get retention(): ObjectElement | undefined {
    return this.get('retention') as ObjectElement | undefined;
  }

  set retention(retention: ObjectElement | undefined) {
    this.set('retention', retention);
  }

  get ttl(): NumberElement | undefined {
    return this.get('ttl') as NumberElement | undefined;
  }

  set ttl(ttl: NumberElement | undefined) {
    this.set('ttl', ttl);
  }

  get deduplication(): BooleanElement | undefined {
    return this.get('deduplication') as BooleanElement | undefined;
  }

  set deduplication(deduplication: BooleanElement | undefined) {
    this.set('deduplication', deduplication);
  }

  get bindingVersion(): StringElement | undefined {
    return this.get('bindingVersion') as StringElement | undefined;
  }

  set bindingVersion(bindingVersion: StringElement | undefined) {
    this.set('bindingVersion', bindingVersion);
  }
}

export default PulsarChannelBinding;
