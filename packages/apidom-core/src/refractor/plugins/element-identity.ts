import { Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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
        enter(path: Path<Element>) {
          path.node.id = identityManager!.identify(path.node);
        },
      },
      post() {
        identityManager = null;
      },
    };
  };

export default plugin;
