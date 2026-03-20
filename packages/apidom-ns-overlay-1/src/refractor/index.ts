import { resolveSpecification, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { traverse } from '@speclynx/apidom-traverse';
import { Element, refract as baseRefract } from '@speclynx/apidom-datamodel';
import { path } from 'ramda';

import type VisitorClass from './visitors/Visitor.ts';
import specification from './specification.ts';
import createToolbox, { type Toolbox } from './toolbox.ts';
import OverlayElement from '../elements/Overlay.ts';
import Overlay1Element from '../elements/Overlay1.ts';
import InfoElement from '../elements/Info.ts';
import ActionElement from '../elements/Action.ts';

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
  readonly consume?: boolean;
}

/**
 * @public
 */
const refract = <T extends Element>(
  value: unknown,
  {
    element = 'overlay1',
    plugins = [],
    specificationObj = specification,
    consume = false,
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
  const RootVisitorClass = path(specPath, resolvedSpec) as new (
    options: Record<string, unknown>,
  ) => InstanceType<typeof VisitorClass>;
  const rootVisitor = new RootVisitorClass({ specObj: resolvedSpec, consume });

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
export const refractOverlay = <T extends Element = OverlayElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'overlay' });

/**
 * @public
 */
export const refractOverlay1 = <T extends Element = Overlay1Element>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'overlay1' });

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
export const refractAction = <T extends Element = ActionElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'action' });

export default refract;
