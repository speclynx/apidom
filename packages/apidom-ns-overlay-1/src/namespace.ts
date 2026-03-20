import type { NamespacePlugin } from '@speclynx/apidom-datamodel';

import OverlayElement from './elements/Overlay.ts';
import Overlay1Element from './elements/Overlay1.ts';
import InfoElement from './elements/Info.ts';
import ActionElement from './elements/Action.ts';

/**
 * @public
 */
const overlay1: NamespacePlugin = {
  namespace: (options) => {
    const { base } = options;

    base.register('overlay', OverlayElement);
    base.register('overlay1', Overlay1Element);
    base.register('info', InfoElement);
    base.register('action', ActionElement);

    return base;
  },
};

export default overlay1;
