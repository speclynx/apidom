import { Element, isPrimitiveElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { IdentityManager } from '../../identity/index.ts';

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
        enter(path: Path<Element>) {
          if (!isPrimitiveElement(path.node)) {
            path.node.id = identityManager!.identify(path.node);
          }
        },
      },
      post() {
        identityManager = null;
      },
    };
  };

export default plugin;
