import { Element } from '@speclynx/apidom-datamodel';
import {
  traverse,
  traverseAsync,
  mergeVisitors,
  mergeVisitorsAsync,
} from '@speclynx/apidom-traverse';
import { mergeDeepRight, propOr } from 'ramda';
import { invokeArgs } from 'ramda-adjunct';

import createToolbox from '../../toolbox.ts';

/**
 * @public
 */
export interface DispatchPluginsOptions {
  toolboxCreator: typeof createToolbox;
  visitorOptions: {
    exposeEdits: boolean;
  };
}

/**
 * @public
 */
export interface DispatchPluginsSync {
  <T extends Element, U extends Element = Element>(
    element: T,
    plugins: ((toolbox: any) => object)[],
    options?: Record<string, unknown>,
  ): U;
  [key: symbol]: DispatchPluginsAsync;
}

/**
 * @public
 */
export interface DispatchPluginsAsync {
  <T extends Element, U extends Element = Element>(
    element: T,
    plugins: ((toolbox: any) => object)[],
    options?: Record<string, unknown>,
  ): Promise<U>;
}

const defaultDispatchPluginsOptions: DispatchPluginsOptions = {
  toolboxCreator: createToolbox,
  visitorOptions: {
    exposeEdits: true,
  },
};

/**
 * @public
 */
export const dispatchPluginsSync: DispatchPluginsSync = ((element, plugins, options = {}) => {
  if (plugins.length === 0) return element;

  const mergedOptions = mergeDeepRight(
    defaultDispatchPluginsOptions,
    options,
  ) as DispatchPluginsOptions;
  const { toolboxCreator, visitorOptions } = mergedOptions;
  const toolbox = toolboxCreator();
  const pluginsSpecs = plugins.map((plugin) => plugin(toolbox));
  const mergedPluginsVisitor = mergeVisitors(
    pluginsSpecs.map(propOr({}, 'visitor')) as object[],
    visitorOptions,
  );

  pluginsSpecs.forEach(invokeArgs(['pre'], []));
  const newElement = traverse(element, mergedPluginsVisitor);
  pluginsSpecs.forEach(invokeArgs(['post'], []));
  return newElement;
}) as DispatchPluginsSync;

export const dispatchPluginsAsync: DispatchPluginsAsync = (async (
  element,
  plugins,
  options = {},
) => {
  if (plugins.length === 0) return element;

  const mergedOptions = mergeDeepRight(
    defaultDispatchPluginsOptions,
    options,
  ) as DispatchPluginsOptions;
  const { toolboxCreator, visitorOptions } = mergedOptions;
  const toolbox = toolboxCreator();
  const pluginsSpecs = plugins.map((plugin) => plugin(toolbox));
  const mergedPluginsVisitor = mergeVisitorsAsync(
    pluginsSpecs.map(propOr({}, 'visitor')) as object[],
    visitorOptions,
  );

  await Promise.allSettled(pluginsSpecs.map(invokeArgs(['pre'], [])));
  const newElement = await traverseAsync(element, mergedPluginsVisitor);
  await Promise.allSettled(pluginsSpecs.map(invokeArgs(['post'], [])));
  return newElement;
}) as DispatchPluginsAsync;

dispatchPluginsSync[Symbol.for('nodejs.util.promisify.custom')] = dispatchPluginsAsync;
