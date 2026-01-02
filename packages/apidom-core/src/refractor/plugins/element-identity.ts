import { Element } from '@speclynx/apidom-datamodel';

import { IdentityManager } from '../../identity/index.ts';

/**
 * Plugin for decorating every element in ApiDOM tree with UUID.
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
          element.id = identityManager!.identify(element);
        },
      },
      post() {
        identityManager = null;
      },
    };
  };

export default plugin;
