import { isArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import type OpenApi3_0Element from '../../elements/OpenApi3-0.ts';
import type PathItemElement from '../../elements/PathItem.ts';
import type ServerElement from '../../elements/Server.ts';
import type OperationElement from '../../elements/Operation.ts';
import ServersElement from '../../elements/nces/Servers.ts';
import PathItemServersElement from '../../elements/nces/PathItemServers.ts';
import OperationServersElement from '../../elements/nces/OperationServers.ts';
import type { Toolbox } from '../toolbox.ts';
import NormalizeStorage from './normalize-storage/index.ts';
import { refractServer } from '../index.ts';

/**
 * Override of Server Objects.
 *
 * List of Server Objects can be defined in OpenAPI 3.0 on multiple levels:
 *
 *  - OpenAPI.servers
 *  - PathItem.servers
 *  - Operation.servers
 *
 * If a servers array is specified at the OpenAPI Object level, it will be overridden by `PathItem`.servers.
 * If a servers array is specified at the Path Item Object or OpenAPI Object level, it will be overridden by Operation.servers.
 * @public
 */

export interface PluginOptions {
  storageField?: string;
}

/**
 * Ensures the OpenAPI document has at least one server defined.
 * If `servers` is missing or empty, adds a default server with `url: "/"`.
 * @public
 */
const ensureDefaultServer = (openapiElement: OpenApi3_0Element): void => {
  const isServersUndefined = typeof openapiElement.servers === 'undefined';
  const isServersArray = isArrayElement(openapiElement.servers);
  const isServersEmpty = isServersArray && openapiElement.servers!.length === 0;
  const defaultServer = refractServer({ url: '/' });

  if (isServersUndefined || !isServersArray) {
    openapiElement.servers = new ServersElement([defaultServer]);
  } else if (isServersArray && isServersEmpty) {
    openapiElement.servers!.push(defaultServer);
  }
};

/**
 * Inherits servers from the OpenAPI root into a PathItem element.
 * If PathItem.servers is missing or empty, copies from OpenAPI.servers.
 * @public
 */
const inheritServersToPathItem = (
  pathItemElement: PathItemElement,
  openapiElement: OpenApi3_0Element,
): void => {
  const isServersUndefined = typeof pathItemElement.servers === 'undefined';
  const isServersArray = isArrayElement(pathItemElement.servers);
  const isServersEmpty = isServersArray && pathItemElement.servers!.length === 0;
  const openapiServers = [...(openapiElement.servers ?? [])] as ServerElement[];

  if (isServersUndefined || !isServersArray) {
    pathItemElement.servers = new PathItemServersElement(openapiServers);
  } else if (isServersArray && isServersEmpty) {
    openapiServers.forEach((server) => {
      pathItemElement.servers!.push(server);
    });
  }
};

/**
 * Inherits servers from a PathItem into an Operation element.
 * If Operation.servers is missing or empty, copies from PathItem.servers.
 * @public
 */
const inheritServersToOperation = (
  operationElement: OperationElement,
  pathItemElement: PathItemElement,
): void => {
  const isServersUndefined = typeof operationElement.servers === 'undefined';
  const isServersArray = isArrayElement(operationElement.servers);
  const isServersEmpty = isServersArray && operationElement.servers!.length === 0;
  const pathItemServers = [...(pathItemElement.servers ?? [])] as ServerElement[];

  if (isServersUndefined || !isServersArray) {
    operationElement.servers = new OperationServersElement(pathItemServers);
  } else if (isServersArray && isServersEmpty) {
    pathItemServers.forEach((server) => {
      operationElement.servers!.push(server);
    });
  }
};

/**
 * @public
 */
const plugin =
  ({ storageField = 'x-normalized' }: PluginOptions = {}) =>
  (toolbox: Toolbox) => {
    const { predicates } = toolbox;
    let storage: NormalizeStorage | undefined;

    return {
      visitor: {
        OpenApi3_0Element: {
          enter(path: Path<OpenApi3_0Element>) {
            const openapiElement = path.node;
            ensureDefaultServer(openapiElement);
            storage = new NormalizeStorage(openapiElement, storageField, 'servers');
          },
          leave() {
            storage = undefined;
          },
        },
        PathItemElement(path: Path<PathItemElement>) {
          const pathItemElement = path.node;
          const ancestors = path.getAncestorNodes(); // parent to root order

          // skip visiting this Path Item
          if (ancestors.some(predicates.isComponentsElement)) return;
          if (!ancestors.some(predicates.isOpenApi3_0Element)) return;

          const pathItemJSONPointer = path.formatPath();

          // skip visiting this Path Item Object if it's already normalized
          if (storage!.includes(pathItemJSONPointer)) {
            return;
          }

          const parentOpenapiElement = ancestors.find(predicates.isOpenApi3_0Element);

          if (predicates.isOpenApi3_0Element(parentOpenapiElement)) {
            inheritServersToPathItem(
              pathItemElement,
              parentOpenapiElement as unknown as OpenApi3_0Element,
            );
            storage!.append(pathItemJSONPointer);
          }
        },
        OperationElement(path: Path<OperationElement>) {
          const operationElement = path.node;
          const ancestors = path.getAncestorNodes(); // parent to root order

          // skip visiting this Operation
          if (ancestors.some(predicates.isComponentsElement)) return;
          if (!ancestors.some(predicates.isOpenApi3_0Element)) return;

          const operationJSONPointer = path.formatPath();

          // skip visiting this Operation Object if it's already normalized
          if (storage!.includes(operationJSONPointer)) {
            return;
          }

          const parentPathItemElement = ancestors.find(predicates.isPathItemElement);

          if (predicates.isPathItemElement(parentPathItemElement)) {
            inheritServersToOperation(
              operationElement,
              parentPathItemElement as unknown as PathItemElement,
            );
            storage!.append(operationJSONPointer);
          }
        },
      },
    };
  };

plugin.ensureDefaultServer = ensureDefaultServer;
plugin.inheritServersToPathItem = inheritServersToPathItem;
plugin.inheritServersToOperation = inheritServersToOperation;

export default plugin;
