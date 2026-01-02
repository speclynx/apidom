import { visit, resolveSpecification, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { Element, refract as baseRefract } from '@speclynx/apidom-datamodel';
import { path } from 'ramda';
import { Visitor as VisitorClass } from '@speclynx/apidom-ns-json-schema-draft-4';

import specification from './specification.ts';
import createToolbox, { type Toolbox } from './toolbox.ts';
import { keyMap, getNodeType } from '../traversal/visitor.ts';
import type JSONSchemaElement from '../elements/JSONSchema.ts';
import type LinkDescriptionElement from '../elements/LinkDescription.ts';

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
  {
    element = 'jSONSchemaDraft6',
    plugins = [],
    specificationObj = specification,
  }: RefractorOptions = {},
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

  visit(genericElement, rootVisitor);

  /**
   * Running plugins visitors means extra single traversal === performance hit.
   */
  return dispatchRefractorPlugins(rootVisitor.element, plugins, {
    toolboxCreator: createToolbox,
    visitorOptions: { keyMap, nodeTypeGetter: getNodeType },
  }) as T;
};

/**
 * Refracts a value into a JSONSchemaElement.
 * @public
 */
export const refractJSONSchema = <T extends Element = JSONSchemaElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'jSONSchemaDraft6' });

/**
 * Refracts a value into a LinkDescriptionElement.
 * @public
 */
export const refractLinkDescription = <T extends Element = LinkDescriptionElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'linkDescription' });

export default refract;
