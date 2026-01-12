import { Element, refract as baseRefract } from '@speclynx/apidom-datamodel';
import { resolveSpecification, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { traverse } from '@speclynx/apidom-traverse';
import { path } from 'ramda';

import type VisitorClass from './visitors/Visitor.ts';
import specification from './specification.ts';
import createToolbox, { type Toolbox } from './toolbox.ts';
/**
 * AsyncApi >= 2.0.0 <=2.6.0 specification elements.
 */
import AsyncApi2Element from '../elements/AsyncApi2.ts';
import AsyncApiVersionElement from '../elements/AsyncApiVersion.ts';
import IdentifierElement from '../elements/Identifier.ts';
import DefaultContentTypeElement from '../elements/DefaultContentType.ts';
import ChannelsElement from '../elements/Channels.ts';
import ServersElement from '../elements/Servers.ts';
import ParametersElement from '../elements/Parameters.ts';
import TagsElement from '../elements/Tags.ts';
import ChannelBindingsElement from '../elements/ChannelBindings.ts';
import ChannelItemElement from '../elements/ChannelItem.ts';
import ComponentsElement from '../elements/Components.ts';
import ContactElement from '../elements/Contact.ts';
import CorrelationIDElement from '../elements/CorrelationID.ts';
import ExternalDocumentationElement from '../elements/ExternalDocumentation.ts';
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
import ReferenceElement from '../elements/Reference.ts';
import SchemaElement from '../elements/Schema.ts';
import SecurityRequirementElement from '../elements/SecurityRequirement.ts';
import SecuritySchemeElement from '../elements/SecurityScheme.ts';
import ServerElement from '../elements/Server.ts';
import ServerBindingsElement from '../elements/ServerBindings.ts';
import ServerVariableElement from '../elements/ServerVariable.ts';
import TagElement from '../elements/Tag.ts';
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
// Google Cloud Pub/Sub
import GooglepubsubChannelBindingElement from '../elements/bindings/googlepubsub/GooglepubsubChannelBinding.ts';
import GooglepubsubMessageBindingElement from '../elements/bindings/googlepubsub/GooglepubsubMessageBinding.ts';
import GooglepubsubOperationBindingElement from '../elements/bindings/googlepubsub/GooglepubsubOperationBinding.ts';
import GooglepubsubServerBindingElement from '../elements/bindings/googlepubsub/GooglepubsubServerBinding.ts';
// HTTP
import HttpChannelBindingElement from '../elements/bindings/http/HttpChannelBinding.ts';
import HttpMessageBindingElement from '../elements/bindings/http/HttpMessageBinding.ts';
import HttpOperationBindingElement from '../elements/bindings/http/HttpOperationBinding.ts';
import HttpServerBindingElement from '../elements/bindings/http/HttpServerBinding.ts';
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

/**
 * @public
 */
export type RefractorPlugin = (toolbox: Toolbox) => {
  visitor?: object;
  pre?: () => void;
  post?: () => void;
};

/**
 * @public
 */
export interface RefractorOptions {
  readonly element?: string;
  readonly plugins?: RefractorPlugin[];
  readonly specificationObj?: typeof specification;
}

/**
 * @public
 */
const refract = <T extends Element>(
  value: unknown,
  { element = 'asyncApi2', plugins = [], specificationObj = specification }: RefractorOptions = {},
): T => {
  const genericElement = baseRefract(value);
  const resolvedSpec = resolveSpecification(specificationObj);
  const elementMap = resolvedSpec.elementMap as Record<string, string[]>;
  const specPath = elementMap[element];

  if (!specPath) {
    throw new Error(`Unknown element type: "${element}"`);
  }

  /**
   * This is where generic ApiDOM becomes semantic (namespace applied).
   * We don't allow consumers to hook into this translation.
   * Though we allow consumers to define their own plugins on already transformed ApiDOM.
   */
  const RootVisitorClass = path(specPath, resolvedSpec) as typeof VisitorClass;
  const rootVisitor = new RootVisitorClass({ specObj: resolvedSpec });

  traverse(genericElement, rootVisitor);

  /**
   * Running plugins visitors means extra single traversal === performance hit.
   */
  return dispatchRefractorPlugins(rootVisitor.element, plugins, {
    toolboxCreator: createToolbox,
  }) as T;
};

/**
 * @public
 */
export const refractAsyncApi2 = <T extends Element = AsyncApi2Element>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'asyncApi2' });

/**
 * @public
 */
export const refractAsyncApiVersion = <T extends Element = AsyncApiVersionElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'asyncApiVersion' });

/**
 * @public
 */
export const refractIdentifier = <T extends Element = IdentifierElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'identifier' });

/**
 * @public
 */
export const refractDefaultContentType = <T extends Element = DefaultContentTypeElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'defaultContentType' });

/**
 * @public
 */
export const refractChannels = <T extends Element = ChannelsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'channels' });

/**
 * @public
 */
export const refractServers = <T extends Element = ServersElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'servers' });

/**
 * @public
 */
export const refractParameters = <T extends Element = ParametersElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'parameters' });

/**
 * @public
 */
export const refractTags = <T extends Element = TagsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'tags' });

/**
 * @public
 */
export const refractChannelBindings = <T extends Element = ChannelBindingsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'channelBindings' });

/**
 * @public
 */
export const refractChannelItem = <T extends Element = ChannelItemElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'channelItem' });

/**
 * @public
 */
export const refractComponents = <T extends Element = ComponentsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'components' });

/**
 * @public
 */
export const refractContact = <T extends Element = ContactElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'contact' });

/**
 * @public
 */
export const refractCorrelationID = <T extends Element = CorrelationIDElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'correlationID' });

/**
 * @public
 */
export const refractExternalDocumentation = <T extends Element = ExternalDocumentationElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'externalDocumentation' });

/**
 * @public
 */
export const refractInfo = <T extends Element = InfoElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'info' });

/**
 * @public
 */
export const refractLicense = <T extends Element = LicenseElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'license' });

/**
 * @public
 */
export const refractMessage = <T extends Element = MessageElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'message' });

/**
 * @public
 */
export const refractMessageBindings = <T extends Element = MessageBindingsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'messageBindings' });

/**
 * @public
 */
export const refractMessageExample = <T extends Element = MessageExampleElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'messageExample' });

/**
 * @public
 */
export const refractMessageTrait = <T extends Element = MessageTraitElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'messageTrait' });

/**
 * @public
 */
export const refractOAuthFlow = <T extends Element = OAuthFlowElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'oAuthFlow' });

/**
 * @public
 */
export const refractOAuthFlows = <T extends Element = OAuthFlowsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'oAuthFlows' });

/**
 * @public
 */
export const refractOperation = <T extends Element = OperationElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'operation' });

/**
 * @public
 */
export const refractOperationBindings = <T extends Element = OperationBindingsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'operationBindings' });

/**
 * @public
 */
export const refractOperationTrait = <T extends Element = OperationTraitElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'operationTrait' });

/**
 * @public
 */
export const refractParameter = <T extends Element = ParameterElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'parameter' });

/**
 * @public
 */
export const refractReference = <T extends Element = ReferenceElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'reference' });

/**
 * @public
 */
export const refractSchema = <T extends Element = SchemaElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'schema' });

/**
 * @public
 */
export const refractSecurityRequirement = <T extends Element = SecurityRequirementElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'securityRequirement' });

/**
 * @public
 */
export const refractSecurityScheme = <T extends Element = SecuritySchemeElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'securityScheme' });

/**
 * @public
 */
export const refractServer = <T extends Element = ServerElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'server' });

/**
 * @public
 */
export const refractServerBindings = <T extends Element = ServerBindingsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'serverBindings' });

/**
 * @public
 */
export const refractServerVariable = <T extends Element = ServerVariableElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'serverVariable' });

/**
 * @public
 */
export const refractTag = <T extends Element = TagElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'tag' });

/**
 * Binding refract functions.
 */
// AMQP 0-9-1
/**
 * @public
 */
export const refractAmqpChannelBinding = <T extends Element = AmqpChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqpChannelBinding' });

/**
 * @public
 */
export const refractAmqpMessageBinding = <T extends Element = AmqpMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqpMessageBinding' });

/**
 * @public
 */
export const refractAmqpOperationBinding = <T extends Element = AmqpOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqpOperationBinding' });

/**
 * @public
 */
export const refractAmqpServerBinding = <T extends Element = AmqpServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqpServerBinding' });

// AMQP 1.0
/**
 * @public
 */
export const refractAmqp1ChannelBinding = <T extends Element = Amqp1ChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqp1ChannelBinding' });

/**
 * @public
 */
export const refractAmqp1MessageBinding = <T extends Element = Amqp1MessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqp1MessageBinding' });

/**
 * @public
 */
export const refractAmqp1OperationBinding = <T extends Element = Amqp1OperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqp1OperationBinding' });

/**
 * @public
 */
export const refractAmqp1ServerBinding = <T extends Element = Amqp1ServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'amqp1ServerBinding' });

// Anypoint MQ
/**
 * @public
 */
export const refractAnypointmqChannelBinding = <
  T extends Element = AnypointmqChannelBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'anypointmqChannelBinding' });

/**
 * @public
 */
export const refractAnypointmqMessageBinding = <
  T extends Element = AnypointmqMessageBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'anypointmqMessageBinding' });

/**
 * @public
 */
export const refractAnypointmqOperationBinding = <
  T extends Element = AnypointmqOperationBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'anypointmqOperationBinding' });

/**
 * @public
 */
export const refractAnypointmqServerBinding = <T extends Element = AnypointmqServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'anypointmqServerBinding' });

// Google Cloud Pub/Sub
/**
 * @public
 */
export const refractGooglepubsubChannelBinding = <
  T extends Element = GooglepubsubChannelBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'googlepubsubChannelBinding' });

/**
 * @public
 */
export const refractGooglepubsubMessageBinding = <
  T extends Element = GooglepubsubMessageBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'googlepubsubMessageBinding' });

/**
 * @public
 */
export const refractGooglepubsubOperationBinding = <
  T extends Element = GooglepubsubOperationBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'googlepubsubOperationBinding' });

/**
 * @public
 */
export const refractGooglepubsubServerBinding = <
  T extends Element = GooglepubsubServerBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'googlepubsubServerBinding' });

// HTTP
/**
 * @public
 */
export const refractHttpChannelBinding = <T extends Element = HttpChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'httpChannelBinding' });

/**
 * @public
 */
export const refractHttpMessageBinding = <T extends Element = HttpMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'httpMessageBinding' });

/**
 * @public
 */
export const refractHttpOperationBinding = <T extends Element = HttpOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'httpOperationBinding' });

/**
 * @public
 */
export const refractHttpServerBinding = <T extends Element = HttpServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'httpServerBinding' });

// IBM MQ
/**
 * @public
 */
export const refractIbmmqChannelBinding = <T extends Element = IbmmqChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'ibmmqChannelBinding' });

/**
 * @public
 */
export const refractIbmmqMessageBinding = <T extends Element = IbmmqMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'ibmmqMessageBinding' });

/**
 * @public
 */
export const refractIbmmqOperationBinding = <T extends Element = IbmmqOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'ibmmqOperationBinding' });

/**
 * @public
 */
export const refractIbmmqServerBinding = <T extends Element = IbmmqServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'ibmmqServerBinding' });

// JMS
/**
 * @public
 */
export const refractJmsChannelBinding = <T extends Element = JmsChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'jmsChannelBinding' });

/**
 * @public
 */
export const refractJmsMessageBinding = <T extends Element = JmsMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'jmsMessageBinding' });

/**
 * @public
 */
export const refractJmsOperationBinding = <T extends Element = JmsOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'jmsOperationBinding' });

/**
 * @public
 */
export const refractJmsServerBinding = <T extends Element = JmsServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'jmsServerBinding' });

// Kafka
/**
 * @public
 */
export const refractKafkaChannelBinding = <T extends Element = KafkaChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'kafkaChannelBinding' });

/**
 * @public
 */
export const refractKafkaMessageBinding = <T extends Element = KafkaMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'kafkaMessageBinding' });

/**
 * @public
 */
export const refractKafkaOperationBinding = <T extends Element = KafkaOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'kafkaOperationBinding' });

/**
 * @public
 */
export const refractKafkaServerBinding = <T extends Element = KafkaServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'kafkaServerBinding' });

// Mercure
/**
 * @public
 */
export const refractMercureChannelBinding = <T extends Element = MercureChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mercureChannelBinding' });

/**
 * @public
 */
export const refractMercureMessageBinding = <T extends Element = MercureMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mercureMessageBinding' });

/**
 * @public
 */
export const refractMercureOperationBinding = <T extends Element = MercureOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mercureOperationBinding' });

/**
 * @public
 */
export const refractMercureServerBinding = <T extends Element = MercureServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mercureServerBinding' });

// MQTT
/**
 * @public
 */
export const refractMqttChannelBinding = <T extends Element = MqttChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqttChannelBinding' });

/**
 * @public
 */
export const refractMqttMessageBinding = <T extends Element = MqttMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqttMessageBinding' });

/**
 * @public
 */
export const refractMqttOperationBinding = <T extends Element = MqttOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqttOperationBinding' });

/**
 * @public
 */
export const refractMqttServerBinding = <T extends Element = MqttServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqttServerBinding' });

// MQTT 5
/**
 * @public
 */
export const refractMqtt5ChannelBinding = <T extends Element = Mqtt5ChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqtt5ChannelBinding' });

/**
 * @public
 */
export const refractMqtt5MessageBinding = <T extends Element = Mqtt5MessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqtt5MessageBinding' });

/**
 * @public
 */
export const refractMqtt5OperationBinding = <T extends Element = Mqtt5OperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqtt5OperationBinding' });

/**
 * @public
 */
export const refractMqtt5ServerBinding = <T extends Element = Mqtt5ServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'mqtt5ServerBinding' });

// NATS
/**
 * @public
 */
export const refractNatsChannelBinding = <T extends Element = NatsChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'natsChannelBinding' });

/**
 * @public
 */
export const refractNatsMessageBinding = <T extends Element = NatsMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'natsMessageBinding' });

/**
 * @public
 */
export const refractNatsOperationBinding = <T extends Element = NatsOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'natsOperationBinding' });

/**
 * @public
 */
export const refractNatsServerBinding = <T extends Element = NatsServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'natsServerBinding' });

// Pulsar
/**
 * @public
 */
export const refractPulsarChannelBinding = <T extends Element = PulsarChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'pulsarChannelBinding' });

/**
 * @public
 */
export const refractPulsarMessageBinding = <T extends Element = PulsarMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'pulsarMessageBinding' });

/**
 * @public
 */
export const refractPulsarOperationBinding = <T extends Element = PulsarOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'pulsarOperationBinding' });

/**
 * @public
 */
export const refractPulsarServerBinding = <T extends Element = PulsarServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'pulsarServerBinding' });

// Redis
/**
 * @public
 */
export const refractRedisChannelBinding = <T extends Element = RedisChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'redisChannelBinding' });

/**
 * @public
 */
export const refractRedisMessageBinding = <T extends Element = RedisMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'redisMessageBinding' });

/**
 * @public
 */
export const refractRedisOperationBinding = <T extends Element = RedisOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'redisOperationBinding' });

/**
 * @public
 */
export const refractRedisServerBinding = <T extends Element = RedisServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'redisServerBinding' });

// SNS
/**
 * @public
 */
export const refractSnsChannelBinding = <T extends Element = SnsChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'snsChannelBinding' });

/**
 * @public
 */
export const refractSnsMessageBinding = <T extends Element = SnsMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'snsMessageBinding' });

/**
 * @public
 */
export const refractSnsOperationBinding = <T extends Element = SnsOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'snsOperationBinding' });

/**
 * @public
 */
export const refractSnsServerBinding = <T extends Element = SnsServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'snsServerBinding' });

// Solace
/**
 * @public
 */
export const refractSolaceChannelBinding = <T extends Element = SolaceChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'solaceChannelBinding' });

/**
 * @public
 */
export const refractSolaceMessageBinding = <T extends Element = SolaceMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'solaceMessageBinding' });

/**
 * @public
 */
export const refractSolaceOperationBinding = <T extends Element = SolaceOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'solaceOperationBinding' });

/**
 * @public
 */
export const refractSolaceServerBinding = <T extends Element = SolaceServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'solaceServerBinding' });

// SQS
/**
 * @public
 */
export const refractSqsChannelBinding = <T extends Element = SqsChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'sqsChannelBinding' });

/**
 * @public
 */
export const refractSqsMessageBinding = <T extends Element = SqsMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'sqsMessageBinding' });

/**
 * @public
 */
export const refractSqsOperationBinding = <T extends Element = SqsOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'sqsOperationBinding' });

/**
 * @public
 */
export const refractSqsServerBinding = <T extends Element = SqsServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'sqsServerBinding' });

// STOMP
/**
 * @public
 */
export const refractStompChannelBinding = <T extends Element = StompChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'stompChannelBinding' });

/**
 * @public
 */
export const refractStompMessageBinding = <T extends Element = StompMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'stompMessageBinding' });

/**
 * @public
 */
export const refractStompOperationBinding = <T extends Element = StompOperationBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'stompOperationBinding' });

/**
 * @public
 */
export const refractStompServerBinding = <T extends Element = StompServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'stompServerBinding' });

// WebSocket
/**
 * @public
 */
export const refractWebSocketChannelBinding = <T extends Element = WebSocketChannelBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'webSocketChannelBinding' });

/**
 * @public
 */
export const refractWebSocketMessageBinding = <T extends Element = WebSocketMessageBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'webSocketMessageBinding' });

/**
 * @public
 */
export const refractWebSocketOperationBinding = <
  T extends Element = WebSocketOperationBindingElement,
>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'webSocketOperationBinding' });

/**
 * @public
 */
export const refractWebSocketServerBinding = <T extends Element = WebSocketServerBindingElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'webSocketServerBinding' });

export default refract;
