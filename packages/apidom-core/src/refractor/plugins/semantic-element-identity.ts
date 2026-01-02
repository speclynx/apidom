import { Element } from '@speclynx/apidom-datamodel';

import { IdentityManager } from '../../identity/index.ts';

/**
 * Primitive element names from the datamodel.
 * Semantic elements have custom names (e.g., 'info', 'schema', 'contact').
 */
const primitiveElementNames = ['object', 'array', 'string', 'number', 'boolean', 'null', 'member'];

const isSemanticElement = (element: Element): boolean =>
  !primitiveElementNames.includes(element.element);

/**
 * Plugin for decorating every semantic element in ApiDOM tree with UUID.
 * @public
 */
const plugin =
  ({ length = 6 } = {}) =>
  () => {
    let identityManager: IdentityManager | null;

    return {
      pre() {
        identityManager = new IdentityManager({ length });
      },
      visitor: {
        enter<T extends Element>(element: T) {
          if (isSemanticElement(element)) {
            (element as Element).id = identityManager!.identify(element);
          }
        },
      },
      post() {
        identityManager = null;
      },
    };
  };

export default plugin;
