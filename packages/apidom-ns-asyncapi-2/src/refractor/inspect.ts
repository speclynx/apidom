import { resolveSpecification, type ResolvedSpecification } from '@speclynx/apidom-core';
import { isPlainObject } from 'ramda-adjunct';

/**
 * AsyncApi >= 2.0.0 <=2.6.0 specification elements.
 */
import AsyncApi2Element from '../elements/AsyncApi2.ts';
import AsyncApiVersionElement from '../elements/AsyncApiVersion.ts';
import ChannelBindingsElement from '../elements/ChannelBindings.ts';
import ChannelItemElement from '../elements/ChannelItem.ts';
import ChannelsElement from '../elements/Channels.ts';
import ComponentsElement from '../elements/Components.ts';
import ContactElement from '../elements/Contact.ts';
import CorrelationIDElement from '../elements/CorrelationID.ts';
import DefaultContentTypeElement from '../elements/DefaultContentType.ts';
import ExternalDocumentationElement from '../elements/ExternalDocumentation.ts';
import IdentifierElement from '../elements/Identifier.ts';
import InfoElement from '../elements/Info.ts';
import LicenseElement from '../elements/License.ts';
import MessageElement from '../elements/Message.ts';
import MessageBindingsElement from '../elements/MessageBindings.ts';
import MessageExampleElement from '../elements/MessageExample.ts';
import MessageTraitElement from '../elements/MessageTrait.ts';
import OAuthFlowElement from '../elements/OAuthFlow.ts';
import OAuthFlowsElement from '../elements/OAuthFlows.ts';
import OperationElement from '../elements/Operation.ts';
import OperationBindingsElement from '../elements/OperationBindings.ts';
import OperationTraitElement from '../elements/OperationTrait.ts';
import ParameterElement from '../elements/Parameter.ts';
import ParametersElement from '../elements/Parameters.ts';
import ReferenceElement from '../elements/Reference.ts';
import SchemaElement from '../elements/Schema.ts';
import SecurityRequirementElement from '../elements/SecurityRequirement.ts';
import SecuritySchemeElement from '../elements/SecurityScheme.ts';
import ServerElement from '../elements/Server.ts';
import ServerBindingsElement from '../elements/ServerBindings.ts';
import ServersElement from '../elements/Servers.ts';
import ServerVariableElement from '../elements/ServerVariable.ts';
import TagElement from '../elements/Tag.ts';
import TagsElement from '../elements/Tags.ts';
/**
 * Binding elements.
 */
// AMQP 0-9-1
import AmqpChannelBindingElement from '../elements/bindings/amqp/AmqpChannelBinding.ts';
import AmqpMessageBindingElement from '../elements/bindings/amqp/AmqpMessageBinding.ts';
import AmqpOperationBindingElement from '../elements/bindings/amqp/AmqpOperationBinding.ts';
import AmqpServerBindingElement from '../elements/bindings/amqp/AmqpServerBinding.ts';
// AMQP 1.0
import Amqp1ChannelBindingElement from '../elements/bindings/amqp1/Amqp1ChannelBinding.ts';
import Amqp1MessageBindingElement from '../elements/bindings/amqp1/Amqp1MessageBinding.ts';
import Amqp1OperationBindingElement from '../elements/bindings/amqp1/Amqp1OperationBinding.ts';
import Amqp1ServerBindingElement from '../elements/bindings/amqp1/Amqp1ServerBinding.ts';
// Anypoint MQ
import AnypointmqChannelBindingElement from '../elements/bindings/anypointmq/AnypointmqChannelBinding.ts';
import AnypointmqMessageBindingElement from '../elements/bindings/anypointmq/AnypointmqMessageBinding.ts';
import AnypointmqOperationBindingElement from '../elements/bindings/anypointmq/AnypointmqOperationBinding.ts';
import AnypointmqServerBindingElement from '../elements/bindings/anypointmq/AnypointmqServerBinding.ts';
// HTTP
import HttpChannelBindingElement from '../elements/bindings/http/HttpChannelBinding.ts';
import HttpMessageBindingElement from '../elements/bindings/http/HttpMessageBinding.ts';
import HttpOperationBindingElement from '../elements/bindings/http/HttpOperationBinding.ts';
import HttpServerBindingElement from '../elements/bindings/http/HttpServerBinding.ts';
// Google Cloud Pub/Sub
import GooglepubsubChannelBindingElement from '../elements/bindings/googlepubsub/GooglepubsubChannelBinding.ts';
import GooglepubsubMessageBindingElement from '../elements/bindings/googlepubsub/GooglepubsubMessageBinding.ts';
import GooglepubsubOperationBindingElement from '../elements/bindings/googlepubsub/GooglepubsubOperationBinding.ts';
import GooglepubsubServerBindingElement from '../elements/bindings/googlepubsub/GooglepubsubServerBinding.ts';
// IBM MQ
import IbmmqChannelBindingElement from '../elements/bindings/ibmmq/IbmmqChannelBinding.ts';
import IbmmqMessageBindingElement from '../elements/bindings/ibmmq/IbmmqMessageBinding.ts';
import IbmmqOperationBindingElement from '../elements/bindings/ibmmq/IbmmqOperationBinding.ts';
import IbmmqServerBindingElement from '../elements/bindings/ibmmq/IbmmqServerBinding.ts';
// JMS
import JmsChannelBindingElement from '../elements/bindings/jms/JmsChannelBinding.ts';
import JmsMessageBindingElement from '../elements/bindings/jms/JmsMessageBinding.ts';
import JmsOperationBindingElement from '../elements/bindings/jms/JmsOperationBinding.ts';
import JmsServerBindingElement from '../elements/bindings/jms/JmsServerBinding.ts';
// Kafka
import KafkaChannelBindingElement from '../elements/bindings/kafka/KafkaChannelBinding.ts';
import KafkaMessageBindingElement from '../elements/bindings/kafka/KafkaMessageBinding.ts';
import KafkaOperationBindingElement from '../elements/bindings/kafka/KafkaOperationBinding.ts';
import KafkaServerBindingElement from '../elements/bindings/kafka/KafkaServerBinding.ts';
// Mercure
import MercureChannelBindingElement from '../elements/bindings/mercure/MercureChannelBinding.ts';
import MercureMessageBindingElement from '../elements/bindings/mercure/MercureMessageBinding.ts';
import MercureOperationBindingElement from '../elements/bindings/mercure/MercureOperationBinding.ts';
import MercureServerBindingElement from '../elements/bindings/mercure/MercureServerBinding.ts';
// MQTT
import MqttChannelBindingElement from '../elements/bindings/mqtt/MqttChannelBinding.ts';
import MqttMessageBindingElement from '../elements/bindings/mqtt/MqttMessageBinding.ts';
import MqttOperationBindingElement from '../elements/bindings/mqtt/MqttOperationBinding.ts';
import MqttServerBindingElement from '../elements/bindings/mqtt/MqttServerBinding.ts';
// MQTT 5
import Mqtt5ChannelBindingElement from '../elements/bindings/mqtt5/Mqtt5ChannelBinding.ts';
import Mqtt5MessageBindingElement from '../elements/bindings/mqtt5/Mqtt5MessageBinding.ts';
import Mqtt5OperationBindingElement from '../elements/bindings/mqtt5/Mqtt5OperationBinding.ts';
import Mqtt5ServerBindingElement from '../elements/bindings/mqtt5/Mqtt5ServerBinding.ts';
// NATS
import NatsChannelBindingElement from '../elements/bindings/nats/NatsChannelBinding.ts';
import NatsMessageBindingElement from '../elements/bindings/nats/NatsMessageBinding.ts';
import NatsOperationBindingElement from '../elements/bindings/nats/NatsOperationBinding.ts';
import NatsServerBindingElement from '../elements/bindings/nats/NatsServerBinding.ts';
// Pulsar
import PulsarChannelBindingElement from '../elements/bindings/pulsar/PulsarChannelBinding.ts';
import PulsarMessageBindingElement from '../elements/bindings/pulsar/PulsarMessageBinding.ts';
import PulsarOperationBindingElement from '../elements/bindings/pulsar/PulsarOperationBinding.ts';
import PulsarServerBindingElement from '../elements/bindings/pulsar/PulsarServerBinding.ts';
// Redis
import RedisChannelBindingElement from '../elements/bindings/redis/RedisChannelBinding.ts';
import RedisMessageBindingElement from '../elements/bindings/redis/RedisMessageBinding.ts';
import RedisOperationBindingElement from '../elements/bindings/redis/RedisOperationBinding.ts';
import RedisServerBindingElement from '../elements/bindings/redis/RedisServerBinding.ts';
// SNS
import SnsChannelBindingElement from '../elements/bindings/sns/SnsChannelBinding.ts';
import SnsMessageBindingElement from '../elements/bindings/sns/SnsMessageBinding.ts';
import SnsOperationBindingElement from '../elements/bindings/sns/SnsOperationBinding.ts';
import SnsServerBindingElement from '../elements/bindings/sns/SnsServerBinding.ts';
// Solace
import SolaceChannelBindingElement from '../elements/bindings/solace/SolaceChannelBinding.ts';
import SolaceMessageBindingElement from '../elements/bindings/solace/SolaceMessageBinding.ts';
import SolaceOperationBindingElement from '../elements/bindings/solace/SolaceOperationBinding.ts';
import SolaceServerBindingElement from '../elements/bindings/solace/SolaceServerBinding.ts';
// SQS
import SqsChannelBindingElement from '../elements/bindings/sqs/SqsChannelBinding.ts';
import SqsMessageBindingElement from '../elements/bindings/sqs/SqsMessageBinding.ts';
import SqsOperationBindingElement from '../elements/bindings/sqs/SqsOperationBinding.ts';
import SqsServerBindingElement from '../elements/bindings/sqs/SqsServerBinding.ts';
// STOMP
import StompChannelBindingElement from '../elements/bindings/stomp/StompChannelBinding.ts';
import StompMessageBindingElement from '../elements/bindings/stomp/StompMessageBinding.ts';
import StompOperationBindingElement from '../elements/bindings/stomp/StompOperationBinding.ts';
import StompServerBindingElement from '../elements/bindings/stomp/StompServerBinding.ts';
// WebSocket
import WebSocketChannelBindingElement from '../elements/bindings/ws/WebSocketChannelBinding.ts';
import WebSocketMessageBindingElement from '../elements/bindings/ws/WebSocketMessageBinding.ts';
import WebSocketOperationBindingElement from '../elements/bindings/ws/WebSocketOperationBinding.ts';
import WebSocketServerBindingElement from '../elements/bindings/ws/WebSocketServerBinding.ts';
import specification from './specification.ts';

/**
 * @public
 */
export interface FixedField {
  name: string;
  alias?: string;
  $visitor: unknown;
}

interface FixedFieldsSpec {
  fixedFields: Record<string, unknown>;
}

interface ResolvedSpec extends ResolvedSpecification {
  visitors: {
    document: {
      objects: Record<string, FixedFieldsSpec> & {
        bindings: Record<string, Record<string, FixedFieldsSpec>>;
      };
    };
  };
}

// Resolve specification to dereference $ref pointers
const resolvedSpec = resolveSpecification<ResolvedSpec>(specification);

// Extract fixed fields as list of { name, alias?, $visitor }
const getFixedFields = (fixedFieldsSpec: Record<string, unknown>): FixedField[] => {
  return Object.entries(fixedFieldsSpec).map(([name, fieldSpec]) => {
    if (isPlainObject(fieldSpec)) {
      return { name, ...fieldSpec } as FixedField;
    }
    return { name, $visitor: fieldSpec };
  });
};

// AsyncApi >= 2.0.0 <=2.6.0 specification elements
Object.defineProperty(AsyncApi2Element, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.AsyncApi.fixedFields),
  enumerable: true,
});

Object.defineProperty(InfoElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Info.fixedFields),
  enumerable: true,
});

Object.defineProperty(ContactElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Contact.fixedFields),
  enumerable: true,
});

Object.defineProperty(LicenseElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.License.fixedFields),
  enumerable: true,
});

Object.defineProperty(ServerElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Server.fixedFields),
  enumerable: true,
});

Object.defineProperty(ServerVariableElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.ServerVariable.fixedFields),
  enumerable: true,
});

Object.defineProperty(ChannelItemElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.ChannelItem.fixedFields),
  enumerable: true,
});

Object.defineProperty(OperationElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Operation.fixedFields),
  enumerable: true,
});

Object.defineProperty(OperationTraitElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.OperationTrait.fixedFields),
  enumerable: true,
});

Object.defineProperty(MessageElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Message.fixedFields),
  enumerable: true,
});

Object.defineProperty(MessageTraitElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.MessageTrait.fixedFields),
  enumerable: true,
});

Object.defineProperty(MessageExampleElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.MessageExample.fixedFields),
  enumerable: true,
});

Object.defineProperty(TagElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Tag.fixedFields),
  enumerable: true,
});

Object.defineProperty(ExternalDocumentationElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.ExternalDocumentation.fixedFields),
  enumerable: true,
});

Object.defineProperty(ComponentsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Components.fixedFields),
  enumerable: true,
});

Object.defineProperty(ReferenceElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Reference.fixedFields),
  enumerable: true,
});

Object.defineProperty(SchemaElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Schema.fixedFields),
  enumerable: true,
});

Object.defineProperty(SecuritySchemeElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.SecurityScheme.fixedFields),
  enumerable: true,
});

Object.defineProperty(OAuthFlowsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.OAuthFlows.fixedFields),
  enumerable: true,
});

Object.defineProperty(OAuthFlowElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.OAuthFlow.fixedFields),
  enumerable: true,
});

Object.defineProperty(ServerBindingsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.ServerBindings.fixedFields),
  enumerable: true,
});

Object.defineProperty(ParameterElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Parameter.fixedFields),
  enumerable: true,
});

Object.defineProperty(ChannelBindingsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.ChannelBindings.fixedFields),
  enumerable: true,
});

Object.defineProperty(OperationBindingsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.OperationBindings.fixedFields),
  enumerable: true,
});

Object.defineProperty(MessageBindingsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.MessageBindings.fixedFields),
  enumerable: true,
});

Object.defineProperty(CorrelationIDElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.CorrelationID.fixedFields),
  enumerable: true,
});

// Binding elements with fixedFields
Object.defineProperty(HttpOperationBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.http.OperationBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(HttpMessageBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.http.MessageBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(WebSocketChannelBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.ws.ChannelBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(KafkaServerBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.kafka.ServerBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(KafkaChannelBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.kafka.ChannelBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(KafkaOperationBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.kafka.OperationBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(KafkaMessageBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.kafka.MessageBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(AnypointmqChannelBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.anypointmq.ChannelBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(AnypointmqMessageBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.anypointmq.MessageBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(AmqpChannelBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.amqp.ChannelBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(AmqpOperationBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.amqp.OperationBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(AmqpMessageBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.amqp.MessageBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(MqttServerBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.mqtt.ServerBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(MqttOperationBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.mqtt.OperationBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(MqttMessageBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.mqtt.MessageBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(NatsOperationBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.nats.OperationBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(PulsarServerBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.pulsar.ServerBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(PulsarChannelBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.pulsar.ChannelBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(SolaceServerBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.solace.ServerBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(SolaceOperationBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.solace.OperationBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(GooglepubsubChannelBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.googlepubsub.ChannelBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(GooglepubsubMessageBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.googlepubsub.MessageBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(IbmmqServerBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.bindings.ibmmq.ServerBinding.fixedFields),
  enumerable: true,
});

Object.defineProperty(IbmmqChannelBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.ibmmq.ChannelBinding.fixedFields,
    ),
  enumerable: true,
});

Object.defineProperty(IbmmqMessageBindingElement, 'fixedFields', {
  get: () =>
    getFixedFields(
      resolvedSpec.visitors.document.objects.bindings.ibmmq.MessageBinding.fixedFields,
    ),
  enumerable: true,
});

export {
  /**
   * AsyncApi >= 2.0.0 <=2.6.0 specification elements.
   */
  AsyncApi2Element,
  AsyncApiVersionElement,
  ChannelBindingsElement,
  ChannelItemElement,
  ChannelsElement,
  ComponentsElement,
  ContactElement,
  CorrelationIDElement,
  DefaultContentTypeElement,
  ExternalDocumentationElement,
  IdentifierElement,
  InfoElement,
  LicenseElement,
  MessageElement,
  MessageBindingsElement,
  MessageExampleElement,
  MessageTraitElement,
  OAuthFlowElement,
  OAuthFlowsElement,
  OperationElement,
  OperationBindingsElement,
  OperationTraitElement,
  ParameterElement,
  ParametersElement,
  ReferenceElement,
  SchemaElement,
  SecurityRequirementElement,
  SecuritySchemeElement,
  ServerElement,
  ServerBindingsElement,
  ServersElement,
  ServerVariableElement,
  TagElement,
  TagsElement,
  /**
   * Binding elements.
   */
  // AMQP 0-9-1
  AmqpChannelBindingElement,
  AmqpMessageBindingElement,
  AmqpOperationBindingElement,
  AmqpServerBindingElement,
  // AMQP 1.0
  Amqp1ChannelBindingElement,
  Amqp1MessageBindingElement,
  Amqp1OperationBindingElement,
  Amqp1ServerBindingElement,
  // Anypoint MQ
  AnypointmqChannelBindingElement,
  AnypointmqMessageBindingElement,
  AnypointmqOperationBindingElement,
  AnypointmqServerBindingElement,
  // Google Cloud Pub/Sub
  GooglepubsubChannelBindingElement,
  GooglepubsubMessageBindingElement,
  GooglepubsubOperationBindingElement,
  GooglepubsubServerBindingElement,
  // HTTP
  HttpChannelBindingElement,
  HttpMessageBindingElement,
  HttpOperationBindingElement,
  HttpServerBindingElement,
  // IBM MQ
  IbmmqChannelBindingElement,
  IbmmqMessageBindingElement,
  IbmmqOperationBindingElement,
  IbmmqServerBindingElement,
  // JMS
  JmsChannelBindingElement,
  JmsMessageBindingElement,
  JmsOperationBindingElement,
  JmsServerBindingElement,
  // Kafka
  KafkaChannelBindingElement,
  KafkaMessageBindingElement,
  KafkaOperationBindingElement,
  KafkaServerBindingElement,
  // Mercure
  MercureChannelBindingElement,
  MercureMessageBindingElement,
  MercureOperationBindingElement,
  MercureServerBindingElement,
  // MQTT
  MqttChannelBindingElement,
  MqttMessageBindingElement,
  MqttOperationBindingElement,
  MqttServerBindingElement,
  // MQTT 5
  Mqtt5ChannelBindingElement,
  Mqtt5MessageBindingElement,
  Mqtt5OperationBindingElement,
  Mqtt5ServerBindingElement,
  // NATS
  NatsChannelBindingElement,
  NatsMessageBindingElement,
  NatsOperationBindingElement,
  NatsServerBindingElement,
  // Pulsar
  PulsarChannelBindingElement,
  PulsarMessageBindingElement,
  PulsarOperationBindingElement,
  PulsarServerBindingElement,
  // Redis
  RedisChannelBindingElement,
  RedisMessageBindingElement,
  RedisOperationBindingElement,
  RedisServerBindingElement,
  // SNS
  SnsChannelBindingElement,
  SnsMessageBindingElement,
  SnsOperationBindingElement,
  SnsServerBindingElement,
  // Solace
  SolaceChannelBindingElement,
  SolaceMessageBindingElement,
  SolaceOperationBindingElement,
  SolaceServerBindingElement,
  // SQS
  SqsChannelBindingElement,
  SqsMessageBindingElement,
  SqsOperationBindingElement,
  SqsServerBindingElement,
  // STOMP
  StompChannelBindingElement,
  StompMessageBindingElement,
  StompOperationBindingElement,
  StompServerBindingElement,
  // WebSocket
  WebSocketChannelBindingElement,
  WebSocketMessageBindingElement,
  WebSocketOperationBindingElement,
  WebSocketServerBindingElement,
};
