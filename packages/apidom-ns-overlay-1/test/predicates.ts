import { assert } from 'chai';

import {
  isOverlay1Element,
  isOverlayElement,
  isInfoElement,
  isActionElement,
  isActionsElement,
  Overlay1Element,
  OverlayElement,
  InfoElement,
  ActionElement,
  ActionsElement,
  isComponentsElement,
  ComponentsElement,
  isComponentsActionsElement,
  ComponentsActionsElement,
  isReusableActionElement,
  ReusableActionElement,
  isReusableActionReferenceElement,
  ReusableActionReferenceElement,
  isReusableActionReferenceLikeElement,
} from '../src/index.ts';
import { ObjectElement } from '@speclynx/apidom-datamodel';

describe('predicates', function () {
  context('isOverlay1Element', function () {
    context('given Overlay1Element instance value', function () {
      specify('should return true', function () {
        const element = new Overlay1Element();

        assert.isTrue(isOverlay1Element(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class OverlaySubElement extends Overlay1Element {}

        assert.isTrue(isOverlay1Element(new OverlaySubElement()));
      });
    });

    context('given non Overlay1Element instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isOverlay1Element(1));
        assert.isFalse(isOverlay1Element(null));
        assert.isFalse(isOverlay1Element(undefined));
        assert.isFalse(isOverlay1Element({}));
        assert.isFalse(isOverlay1Element([]));
        assert.isFalse(isOverlay1Element('string'));
      });
    });
  });

  context('isInfoElement', function () {
    context('given InfoElement instance value', function () {
      specify('should return true', function () {
        const element = new InfoElement();

        assert.isTrue(isInfoElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class InfoSubElement extends InfoElement {}

        assert.isTrue(isInfoElement(new InfoSubElement()));
      });
    });

    context('given non InfoElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isInfoElement(1));
        assert.isFalse(isInfoElement(null));
        assert.isFalse(isInfoElement(undefined));
        assert.isFalse(isInfoElement({}));
        assert.isFalse(isInfoElement([]));
        assert.isFalse(isInfoElement('string'));
      });
    });
  });

  context('isOverlayElement', function () {
    context('given OverlayElement instance value', function () {
      specify('should return true', function () {
        const element = new OverlayElement();

        assert.isTrue(isOverlayElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class OverlaySubElement extends OverlayElement {}

        assert.isTrue(isOverlayElement(new OverlaySubElement()));
      });
    });

    context('given non OverlayElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isOverlayElement(1));
        assert.isFalse(isOverlayElement(null));
        assert.isFalse(isOverlayElement(undefined));
        assert.isFalse(isOverlayElement({}));
        assert.isFalse(isOverlayElement([]));
        assert.isFalse(isOverlayElement('string'));
      });
    });
  });

  context('isActionElement', function () {
    context('given ActionElement instance value', function () {
      specify('should return true', function () {
        const element = new ActionElement();

        assert.isTrue(isActionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ActionSubElement extends ActionElement {}

        assert.isTrue(isActionElement(new ActionSubElement()));
      });
    });

    context('given non ActionElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isActionElement(1));
        assert.isFalse(isActionElement(null));
        assert.isFalse(isActionElement(undefined));
        assert.isFalse(isActionElement({}));
        assert.isFalse(isActionElement([]));
        assert.isFalse(isActionElement('string'));
      });
    });
  });

  context('isActionsElement', function () {
    context('given ActionsElement instance value', function () {
      specify('should return true', function () {
        const element = new ActionsElement();

        assert.isTrue(isActionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ActionsSubElement extends ActionsElement {}

        assert.isTrue(isActionsElement(new ActionsSubElement()));
      });
    });

    context('given non ActionsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isActionsElement(1));
        assert.isFalse(isActionsElement(null));
        assert.isFalse(isActionsElement(undefined));
        assert.isFalse(isActionsElement({}));
        assert.isFalse(isActionsElement([]));
        assert.isFalse(isActionsElement('string'));
      });
    });
  });

  context('isComponentsElement', function () {
    context('given ComponentsElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsElement();

        assert.isTrue(isComponentsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsSubElement extends ComponentsElement {}

        assert.isTrue(isComponentsElement(new ComponentsSubElement()));
      });
    });

    context('given non ComponentsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsElement(1));
        assert.isFalse(isComponentsElement(null));
        assert.isFalse(isComponentsElement(undefined));
        assert.isFalse(isComponentsElement({}));
        assert.isFalse(isComponentsElement([]));
        assert.isFalse(isComponentsElement('string'));
      });
    });
  });

  context('isComponentsActionsElement', function () {
    context('given ComponentsActionsElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsActionsElement();

        assert.isTrue(isComponentsActionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsActionsSubElement extends ComponentsActionsElement {}

        assert.isTrue(isComponentsActionsElement(new ComponentsActionsSubElement()));
      });
    });

    context('given non ComponentsActionsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsActionsElement(1));
        assert.isFalse(isComponentsActionsElement(null));
        assert.isFalse(isComponentsActionsElement(undefined));
        assert.isFalse(isComponentsActionsElement({}));
        assert.isFalse(isComponentsActionsElement([]));
        assert.isFalse(isComponentsActionsElement('string'));
      });
    });
  });

  context('isReusableActionElement', function () {
    context('given ReusableActionElement instance value', function () {
      specify('should return true', function () {
        const element = new ReusableActionElement();

        assert.isTrue(isReusableActionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ReusableActionSubElement extends ReusableActionElement {}

        assert.isTrue(isReusableActionElement(new ReusableActionSubElement()));
      });
    });

    context('given non ReusableActionElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isReusableActionElement(1));
        assert.isFalse(isReusableActionElement(null));
        assert.isFalse(isReusableActionElement(undefined));
        assert.isFalse(isReusableActionElement({}));
        assert.isFalse(isReusableActionElement([]));
        assert.isFalse(isReusableActionElement('string'));
      });
    });
  });

  context('isReusableActionReferenceElement', function () {
    context('given ReusableActionReferenceElement instance value', function () {
      specify('should return true', function () {
        const element = new ReusableActionReferenceElement();

        assert.isTrue(isReusableActionReferenceElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ReusableActionReferenceSubElement extends ReusableActionReferenceElement {}

        assert.isTrue(isReusableActionReferenceElement(new ReusableActionReferenceSubElement()));
      });
    });

    context('given non ReusableActionReferenceElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isReusableActionReferenceElement(1));
        assert.isFalse(isReusableActionReferenceElement(null));
        assert.isFalse(isReusableActionReferenceElement(undefined));
        assert.isFalse(isReusableActionReferenceElement({}));
        assert.isFalse(isReusableActionReferenceElement([]));
        assert.isFalse(isReusableActionReferenceElement('string'));
      });
    });
  });

  context('isReusableActionReferenceLikeElement', function () {
    context('given object element with $ref field', function () {
      specify('should return true', function () {
        const element = new ObjectElement({ $ref: '#/components/actions/a' });

        assert.isTrue(isReusableActionReferenceLikeElement(element));
      });
    });

    context('given object element without $ref field', function () {
      specify('should return false', function () {
        assert.isFalse(isReusableActionReferenceLikeElement(new ObjectElement({ target: '$' })));
        assert.isFalse(isReusableActionReferenceLikeElement({ $ref: '#/components/actions/a' }));
      });
    });
  });
});
