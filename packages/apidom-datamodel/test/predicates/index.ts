import { assert } from 'chai';

import {
  Element,
  StringElement,
  ArrayElement,
  ObjectElement,
  NumberElement,
  NullElement,
  BooleanElement,
  MemberElement,
  LinkElement,
  RefElement,
  ParseResultElement,
  AnnotationElement,
  SourceMapElement,
  isElement,
  isStringElement,
  isNumberElement,
  isNullElement,
  isBooleanElement,
  isArrayElement,
  isObjectElement,
  isMemberElement,
  isLinkElement,
  isRefElement,
  isParseResultElement,
  isAnnotationElement,
  isSourceMapElement,
  hasElementSourceMap,
  includesSymbols,
  includesClasses,
} from '../../src/index.ts';

describe('predicates', function () {
  context('isElement', function () {
    context('given Element instance value', function () {
      specify('should return true', function () {
        const element = new Element();

        assert.isTrue(isElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        assert.isTrue(isElement(new StringElement()));
        assert.isTrue(isElement(new ArrayElement()));
        assert.isTrue(isElement(new ObjectElement()));
      });
    });

    context('given non Element instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isElement(1));
        assert.isFalse(isElement(null));
        assert.isFalse(isElement(undefined));
        assert.isFalse(isElement({}));
        assert.isFalse(isElement([]));
        assert.isFalse(isElement('string'));
      });
    });
  });

  context('isStringElement', function () {
    context('given StringElement instance value', function () {
      specify('should return true', function () {
        const element = new StringElement();

        assert.isTrue(isStringElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StringSubElement extends StringElement {}

        assert.isTrue(isStringElement(new StringSubElement()));
      });
    });

    context('given non StringElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStringElement(1));
        assert.isFalse(isStringElement(null));
        assert.isFalse(isStringElement(undefined));
        assert.isFalse(isStringElement({}));
        assert.isFalse(isStringElement([]));
        assert.isFalse(isStringElement('string'));

        assert.isFalse(isStringElement(new ArrayElement()));
        assert.isFalse(isStringElement(new ObjectElement()));
      });
    });
  });

  context('isNumberElement', function () {
    context('given NumberElement instance value', function () {
      specify('should return true', function () {
        const element = new NumberElement();

        assert.isTrue(isNumberElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class NumberSubElement extends NumberElement {}

        assert.isTrue(isNumberElement(new NumberSubElement()));
      });
    });

    context('given non NumberElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isNumberElement(1));
        assert.isFalse(isNumberElement(null));
        assert.isFalse(isNumberElement(undefined));
        assert.isFalse(isNumberElement({}));
        assert.isFalse(isNumberElement([]));
        assert.isFalse(isNumberElement('string'));

        assert.isFalse(isNumberElement(new ArrayElement()));
        assert.isFalse(isNumberElement(new ObjectElement()));
      });
    });
  });

  context('isNullElement', function () {
    context('given NullElement instance value', function () {
      specify('should return true', function () {
        const element = new NullElement();

        assert.isTrue(isNullElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class NullSubElement extends NullElement {}

        assert.isTrue(isNullElement(new NullSubElement()));
      });
    });

    context('given non NullElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isNullElement(1));
        assert.isFalse(isNullElement(null));
        assert.isFalse(isNullElement(undefined));
        assert.isFalse(isNullElement({}));
        assert.isFalse(isNullElement([]));
        assert.isFalse(isNullElement('string'));

        assert.isFalse(isNullElement(new ArrayElement()));
        assert.isFalse(isNullElement(new ObjectElement()));
      });
    });
  });

  context('isBooleanElement', function () {
    context('given BooleanElement instance value', function () {
      specify('should return true', function () {
        const element = new BooleanElement();

        assert.isTrue(isBooleanElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class BooleanSubElement extends BooleanElement {}

        assert.isTrue(isBooleanElement(new BooleanSubElement()));
      });
    });

    context('given non BooleanElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isBooleanElement(1));
        assert.isFalse(isBooleanElement(null));
        assert.isFalse(isBooleanElement(undefined));
        assert.isFalse(isBooleanElement({}));
        assert.isFalse(isBooleanElement([]));
        assert.isFalse(isBooleanElement('string'));

        assert.isFalse(isBooleanElement(new ArrayElement()));
        assert.isFalse(isBooleanElement(new ObjectElement()));
      });
    });
  });

  context('isArrayElement', function () {
    context('given ArrayElement instance value', function () {
      specify('should return true', function () {
        const element = new ArrayElement();

        assert.isTrue(isArrayElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ArraySubElement extends ArrayElement {}

        assert.isTrue(isArrayElement(new ArraySubElement()));
      });
    });

    context('given ObjectElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isArrayElement(new ObjectElement()));
      });
    });

    context('given non ArrayElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isArrayElement(1));
        assert.isFalse(isArrayElement(null));
        assert.isFalse(isArrayElement(undefined));
        assert.isFalse(isArrayElement({}));
        assert.isFalse(isArrayElement([]));
        assert.isFalse(isArrayElement('string'));

        assert.isFalse(isArrayElement(new StringElement()));
        assert.isFalse(isArrayElement(new BooleanElement()));
      });
    });
  });

  context('isObjectElement', function () {
    context('given ObjectElement instance value', function () {
      specify('should return true', function () {
        const element = new ObjectElement();

        assert.isTrue(isObjectElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ObjectSubElement extends ObjectElement {}

        assert.isTrue(isObjectElement(new ObjectSubElement()));
      });
    });

    context('given non ObjectElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isObjectElement(1));
        assert.isFalse(isObjectElement(null));
        assert.isFalse(isObjectElement(undefined));
        assert.isFalse(isObjectElement({}));
        assert.isFalse(isObjectElement([]));
        assert.isFalse(isObjectElement('string'));

        assert.isFalse(isObjectElement(new StringElement()));
        assert.isFalse(isObjectElement(new BooleanElement()));
      });
    });
  });

  context('isMemberElement', function () {
    context('given MemberElement instance value', function () {
      specify('should return true', function () {
        const element = new MemberElement();

        assert.isTrue(isMemberElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class MemberSubElement extends MemberElement {}

        assert.isTrue(isMemberElement(new MemberSubElement()));
      });
    });

    context('given non MemberElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isMemberElement(1));
        assert.isFalse(isMemberElement(null));
        assert.isFalse(isMemberElement(undefined));
        assert.isFalse(isMemberElement({}));
        assert.isFalse(isMemberElement([]));
        assert.isFalse(isMemberElement('string'));

        assert.isFalse(isMemberElement(new StringElement()));
        assert.isFalse(isMemberElement(new BooleanElement()));
      });
    });
  });

  context('isLinkElement', function () {
    context('given LinkElement instance value', function () {
      specify('should return true', function () {
        const element = new LinkElement();

        assert.isTrue(isLinkElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class LinkSubElement extends LinkElement {}

        assert.isTrue(isLinkElement(new LinkSubElement()));
      });
    });

    context('given non LinkElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isLinkElement(1));
        assert.isFalse(isLinkElement(null));
        assert.isFalse(isLinkElement(undefined));
        assert.isFalse(isLinkElement({}));
        assert.isFalse(isLinkElement([]));
        assert.isFalse(isLinkElement('string'));

        assert.isFalse(isLinkElement(new StringElement()));
        assert.isFalse(isLinkElement(new BooleanElement()));
      });
    });
  });

  context('isRefElement', function () {
    context('given RefElement instance value', function () {
      specify('should return true', function () {
        const element = new RefElement();

        assert.isTrue(isRefElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class RefSubElement extends RefElement {}

        assert.isTrue(isRefElement(new RefSubElement()));
      });
    });

    context('given non RefElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isRefElement(1));
        assert.isFalse(isRefElement(null));
        assert.isFalse(isRefElement(undefined));
        assert.isFalse(isRefElement({}));
        assert.isFalse(isRefElement([]));
        assert.isFalse(isRefElement('string'));

        assert.isFalse(isRefElement(new StringElement()));
        assert.isFalse(isRefElement(new BooleanElement()));
      });
    });
  });

  context('isParseResultElement', function () {
    context('given ParseResultElement instance value', function () {
      specify('should return true', function () {
        const element = new ParseResultElement();

        assert.isTrue(isParseResultElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ParseResultSubElement extends ParseResultElement {}

        assert.isTrue(isParseResultElement(new ParseResultSubElement()));
      });
    });

    context('given non ParseResultElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isParseResultElement(1));
        assert.isFalse(isParseResultElement(null));
        assert.isFalse(isParseResultElement(undefined));
        assert.isFalse(isParseResultElement({}));
        assert.isFalse(isParseResultElement([]));
        assert.isFalse(isParseResultElement('string'));

        assert.isFalse(isParseResultElement(new StringElement()));
        assert.isFalse(isParseResultElement(new BooleanElement()));
      });
    });
  });

  context('isAnnotationElement', function () {
    context('given AnnotationElement instance value', function () {
      specify('should return true', function () {
        const element = new AnnotationElement();

        assert.isTrue(isAnnotationElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class AnnotationSubElement extends AnnotationElement {}

        assert.isTrue(isAnnotationElement(new AnnotationSubElement()));
      });
    });

    context('given non AnnotationElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isAnnotationElement(1));
        assert.isFalse(isAnnotationElement(null));
        assert.isFalse(isAnnotationElement(undefined));
        assert.isFalse(isAnnotationElement({}));
        assert.isFalse(isAnnotationElement([]));
        assert.isFalse(isAnnotationElement('string'));

        assert.isFalse(isAnnotationElement(new StringElement()));
        assert.isFalse(isAnnotationElement(new BooleanElement()));
      });
    });
  });

  context('isSourceMapElement', function () {
    context('given SourceMapElement instance value', function () {
      specify('should return true', function () {
        const element = new SourceMapElement();

        assert.isTrue(isSourceMapElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SourceMapSubElement extends SourceMapElement {}

        assert.isTrue(isSourceMapElement(new SourceMapSubElement()));
      });
    });

    context('given non SourceMapElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSourceMapElement(1));
        assert.isFalse(isSourceMapElement(null));
        assert.isFalse(isSourceMapElement(undefined));
        assert.isFalse(isSourceMapElement({}));
        assert.isFalse(isSourceMapElement([]));
        assert.isFalse(isSourceMapElement('string'));

        assert.isFalse(isSourceMapElement(new StringElement()));
        assert.isFalse(isSourceMapElement(new BooleanElement()));
      });
    });
  });

  context('hasElementSourceMap', function () {
    context('given element has all source position properties', function () {
      specify('should return true', function () {
        const element = new ObjectElement({ prop: 'val' });
        element.startLine = 0;
        element.startCharacter = 0;
        element.startOffset = 0;
        element.endLine = 1;
        element.endCharacter = 10;
        element.endOffset = 20;

        assert.isTrue(hasElementSourceMap(element));
      });
    });

    context('given element has partial source position properties', function () {
      specify('should return false', function () {
        const element = new ObjectElement({ prop: 'val' });
        element.startLine = 0;
        element.startCharacter = 0;
        // missing other properties

        assert.isFalse(hasElementSourceMap(element));
      });
    });

    context('given element has no source position properties', function () {
      specify('should return false', function () {
        const element = new ObjectElement({ prop: 'val' });

        assert.isFalse(hasElementSourceMap(element));
      });
    });
  });

  context('includesSymbols', function () {
    context('given intersecting symbols', function () {
      specify('should return true', function () {
        const element = new ObjectElement({ prop: 'val' });
        element.attributes.set('symbols', ['symbol1', 'symbol2']);

        assert.isTrue(includesSymbols(element, ['symbol1']));
      });
    });

    context('given no symbols key in attributes', function () {
      context('and providing at least one search symbol', function () {
        specify('should return false', function () {
          const element = new ObjectElement({ prop: 'val' });

          assert.isFalse(includesSymbols(element, ['symbol1']));
        });
      });

      context('and providing no search symbol', function () {
        specify('should return true', function () {
          const element = new ObjectElement({ prop: 'val' });

          assert.isTrue(includesSymbols(element, []));
        });
      });
    });

    context('given empty symbols list in attributes', function () {
      context('and providing at least one search symbol', function () {
        specify('should return false', function () {
          const element = new ObjectElement({ prop: 'val' });
          element.attributes.set('symbols', []);

          assert.isFalse(includesSymbols(element, ['symbol1']));
        });
      });

      context('and providing no search symbol', function () {
        specify('should return true', function () {
          const element = new ObjectElement({ prop: 'val' });
          element.attributes.set('symbols', []);

          assert.isTrue(includesSymbols(element, []));
        });
      });
    });

    context('given no intersecting symbols', function () {
      specify('should return false', function () {
        const element = new ObjectElement({ prop: 'val' });
        element.attributes.set('symbols', ['symbol1', 'symbol2']);

        assert.isFalse(includesSymbols(element, ['symbol3']));
      });
    });
  });

  context('includesClasses', function () {
    context('given intersecting classes', function () {
      specify('should return true', function () {
        const element = new ObjectElement({ prop: 'val' });
        element.classes.push('class1', 'class2');

        assert.isTrue(includesClasses(element, ['class1']));
      });
    });

    context('given empty classes list in attributes', function () {
      context('and providing at least one search class', function () {
        specify('should return false', function () {
          const element = new ObjectElement({ prop: 'val' });

          assert.isFalse(includesClasses(element, ['class1']));
        });
      });

      context('and providing no search class', function () {
        specify('should return true', function () {
          const element = new ObjectElement({ prop: 'val' });

          assert.isTrue(includesClasses(element, []));
        });
      });
    });

    context('given no intersecting classes', function () {
      specify('should return false', function () {
        const element = new ObjectElement({ prop: 'val' });
        element.classes.push('class1', 'class2');

        assert.isFalse(includesClasses(element, ['class3']));
      });
    });
  });
});
