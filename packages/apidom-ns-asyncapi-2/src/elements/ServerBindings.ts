import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

import HttpServerBindingElement from './bindings/http/HttpServerBinding.ts';
import WebSocketServerBindingElement from './bindings/ws/WebSocketServerBinding.ts';
import KafkaServerBindingElement from './bindings/kafka/KafkaServerBinding.ts';
import AnypointmqServerBindingElement from './bindings/anypointmq/AnypointmqServerBinding.ts';
import AmqpServerBindingElement from './bindings/amqp/AmqpServerBinding.ts';
import Amqp1ServerBindingElement from './bindings/amqp1/Amqp1ServerBinding.ts';
import MqttServerBindingElement from './bindings/mqtt/MqttServerBinding.ts';
import Mqtt5ServerBindingElement from './bindings/mqtt5/Mqtt5ServerBinding.ts';
import NatsServerBindingElement from './bindings/nats/NatsServerBinding.ts';
import JmsServerBindingElement from './bindings/jms/JmsServerBinding.ts';
import SnsServerBindingElement from './bindings/sns/SnsServerBinding.ts';
import SolaceServerBindingElement from './bindings/solace/SolaceServerBinding.ts';
import SqsServerBindingElement from './bindings/sqs/SqsServerBinding.ts';
import StompServerBindingElement from './bindings/stomp/StompServerBinding.ts';
import RedisServerBindingElement from './bindings/redis/RedisServerBinding.ts';
import MercureServerBindingElement from './bindings/mercure/MercureServerBinding.ts';
import IbmmqServerBindingElement from './bindings/ibmmq/IbmmqServerBinding.ts';
import GooglepubsubServerBindingElement from './bindings/googlepubsub/GooglepubsubServerBinding.ts';

/**
 * @public
 */
class ServerBindings extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'serverBindings';
  }

  get http(): HttpServerBindingElement | undefined {
    return this.get('http') as HttpServerBindingElement | undefined;
  }

  set http(http: HttpServerBindingElement | undefined) {
    this.set('http', http);
  }

  get ws(): WebSocketServerBindingElement | undefined {
    return this.get('ws') as WebSocketServerBindingElement | undefined;
  }

  set ws(ws: WebSocketServerBindingElement | undefined) {
    this.set('ws', ws);
  }

  get kafka(): KafkaServerBindingElement | undefined {
    return this.get('kafka') as KafkaServerBindingElement | undefined;
  }

  set kafka(kafka: KafkaServerBindingElement | undefined) {
    this.set('kafka', kafka);
  }

  get anypointmq(): AnypointmqServerBindingElement | undefined {
    return this.get('anypointmq') as AnypointmqServerBindingElement | undefined;
  }

  set anypointmq(anypointmq: AnypointmqServerBindingElement | undefined) {
    this.set('anypointmq', anypointmq);
  }

  get amqp(): AmqpServerBindingElement | undefined {
    return this.get('amqp') as AmqpServerBindingElement | undefined;
  }

  set amqp(amqp: AmqpServerBindingElement | undefined) {
    this.set('amqp', amqp);
  }

  get amqp1(): Amqp1ServerBindingElement | undefined {
    return this.get('amqp1') as Amqp1ServerBindingElement | undefined;
  }

  set amqp1(amqp1: Amqp1ServerBindingElement | undefined) {
    this.set('amqp1', amqp1);
  }

  get mqtt(): MqttServerBindingElement | undefined {
    return this.get('mqtt') as MqttServerBindingElement | undefined;
  }

  set mqtt(mqtt: MqttServerBindingElement | undefined) {
    this.set('mqtt', mqtt);
  }

  get mqtt5(): Mqtt5ServerBindingElement | undefined {
    return this.get('mqtt5') as Mqtt5ServerBindingElement | undefined;
  }

  set mqtt5(mqtt5: Mqtt5ServerBindingElement | undefined) {
    this.set('mqtt5', mqtt5);
  }

  get nats(): NatsServerBindingElement | undefined {
    return this.get('nats') as NatsServerBindingElement | undefined;
  }

  set nats(nats: NatsServerBindingElement | undefined) {
    this.set('nats', nats);
  }

  get jms(): JmsServerBindingElement | undefined {
    return this.get('jms') as JmsServerBindingElement | undefined;
  }

  set jms(jms: JmsServerBindingElement | undefined) {
    this.set('jms', jms);
  }

  get sns(): SnsServerBindingElement | undefined {
    return this.get('sns') as SnsServerBindingElement | undefined;
  }

  set sns(sns: SnsServerBindingElement | undefined) {
    this.set('sns', sns);
  }

  get solace(): SolaceServerBindingElement | undefined {
    return this.get('solace') as SolaceServerBindingElement | undefined;
  }

  set solace(solace: SolaceServerBindingElement | undefined) {
    this.set('solace', solace);
  }

  get sqs(): SqsServerBindingElement | undefined {
    return this.get('sqs') as SqsServerBindingElement | undefined;
  }

  set sqs(sqs: SqsServerBindingElement | undefined) {
    this.set('sqs', sqs);
  }

  get stomp(): StompServerBindingElement | undefined {
    return this.get('stomp') as StompServerBindingElement | undefined;
  }

  set stomp(stomp: StompServerBindingElement | undefined) {
    this.set('stomp', stomp);
  }

  get redis(): RedisServerBindingElement | undefined {
    return this.get('redis') as RedisServerBindingElement | undefined;
  }

  set redis(redis: RedisServerBindingElement | undefined) {
    this.set('redis', redis);
  }

  get mercure(): MercureServerBindingElement | undefined {
    return this.get('mercure') as MercureServerBindingElement | undefined;
  }

  set mercure(mercure: MercureServerBindingElement | undefined) {
    this.set('mercure', mercure);
  }

  get googlepubsub(): GooglepubsubServerBindingElement | undefined {
    return this.get('googlepubsub') as GooglepubsubServerBindingElement | undefined;
  }

  set googlepubsub(googlepubsub: GooglepubsubServerBindingElement | undefined) {
    this.set('googlepubsub', googlepubsub);
  }

  get ibmmq(): IbmmqServerBindingElement | undefined {
    return this.get('ibmmq') as IbmmqServerBindingElement | undefined;
  }

  set ibmmq(ibmmq: IbmmqServerBindingElement | undefined) {
    this.set('ibmmq', ibmmq);
  }
}

export default ServerBindings;
