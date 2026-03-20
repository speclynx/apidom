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
} from '../src/index.ts';

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
});
