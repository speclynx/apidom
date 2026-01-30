import AsyncApi2Element from './elements/AsyncApi2.ts';
import AsyncApiVersionElement from './elements/AsyncApiVersion.ts';
import ChannelBindingsElement from './elements/ChannelBindings.ts';
import ChannelItemElement from './elements/ChannelItem.ts';
import ChannelsElement from './elements/Channels.ts';
import ComponentsElement from './elements/Components.ts';
import ContactElement from './elements/Contact.ts';
import IdentifierElement from './elements/Identifier.ts';
import InfoElement from './elements/Info.ts';
import LicenseElement from './elements/License.ts';
import OperationElement from './elements/Operation.ts';
import ParameterElement from './elements/Parameter.ts';
import ParametersElement from './elements/Parameters.ts';
import ReferenceElement from './elements/Reference.ts';
import SchemaElement from './elements/Schema.ts';
import SecurityRequirementElement from './elements/SecurityRequirement.ts';
import ServerElement from './elements/Server.ts';
import ServerBindingsElement from './elements/ServerBindings.ts';
import ServersElement from './elements/Servers.ts';
import ServerVariableElement from './elements/ServerVariable.ts';

export { isBooleanJSONSchemaElement } from '@speclynx/apidom-ns-json-schema-draft-7';

/**
 * @public
 */
export const isAsyncApi2Element = (element: unknown): element is AsyncApi2Element =>
  element instanceof AsyncApi2Element;

/**
 * @public
 */
export const isAsyncApiVersionElement = (element: unknown): element is AsyncApiVersionElement =>
  element instanceof AsyncApiVersionElement;

/**
 * @public
 */
export const isChannelBindingsElement = (element: unknown): element is ChannelBindingsElement =>
  element instanceof ChannelBindingsElement;

/**
 * @public
 */
export const isChannelItemElement = (element: unknown): element is ChannelItemElement =>
  element instanceof ChannelItemElement;

/**
 * @public
 */
export const isChannelsElement = (element: unknown): element is ChannelsElement =>
  element instanceof ChannelsElement;

/**
 * @public
 */
export const isComponentsElement = (element: unknown): element is ComponentsElement =>
  element instanceof ComponentsElement;

/**
 * @public
 */
export const isContactElement = (element: unknown): element is ContactElement =>
  element instanceof ContactElement;

/**
 * @public
 */
export const isIdentifierElement = (element: unknown): element is IdentifierElement =>
  element instanceof IdentifierElement;

/**
 * @public
 */
export const isInfoElement = (element: unknown): element is InfoElement =>
  element instanceof InfoElement;

/**
 * @public
 */
export const isLicenseElement = (element: unknown): element is LicenseElement =>
  element instanceof LicenseElement;

/**
 * @public
 */
export const isOperationElement = (element: unknown): element is OperationElement =>
  element instanceof OperationElement;

/**
 * @public
 */
export const isParameterElement = (element: unknown): element is ParameterElement =>
  element instanceof ParameterElement;

/**
 * @public
 */
export const isParametersElement = (element: unknown): element is ParametersElement =>
  element instanceof ParametersElement;

/**
 * @public
 */
export const isReferenceElement = (element: unknown): element is ReferenceElement =>
  element instanceof ReferenceElement;

/**
 * @public
 */
export const isSchemaElement = (element: unknown): element is SchemaElement =>
  element instanceof SchemaElement;

/**
 * @public
 */
export const isSecurityRequirementElement = (
  element: unknown,
): element is SecurityRequirementElement => element instanceof SecurityRequirementElement;

/**
 * @public
 */
export const isServerElement = (element: unknown): element is ServerElement =>
  element instanceof ServerElement;

/**
 * @public
 */
export const isServerBindingsElement = (element: unknown): element is ServerBindingsElement =>
  element instanceof ServerBindingsElement;

/**
 * @public
 */
export const isServersElement = (element: unknown): element is ServersElement =>
  element instanceof ServersElement;

/**
 * @public
 */
export const isServerVariableElement = (element: unknown): element is ServerVariableElement =>
  element instanceof ServerVariableElement;
