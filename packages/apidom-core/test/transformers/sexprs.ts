import { assert } from 'chai';
import dedent from 'dedent';
import { trim } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { sexprs } from '../../src/index.ts';

// Ad-hoc semantic element classes for testing
class ContactElement extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'contact';
  }
}

class LicenseElement extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'license';
  }
}

class InfoElement extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'info';
  }
}

describe('sexprs', function () {
  context('given generic ApiDOM', function () {
    specify('should transform into S-expressions', function () {
      const genericObj = new ObjectElement({
        a: 1,
        b: true,
        c: ['a', null],
      });
      const expected = trim(dedent`
        (ObjectElement
          (MemberElement
            (StringElement)
            (NumberElement))
          (MemberElement
            (StringElement)
            (BooleanElement))
          (MemberElement
            (StringElement)
            (ArrayElement
              (StringElement)
              (NullElement))))`);

      assert.strictEqual(sexprs(genericObj), expected);
    });
  });

  context('given semantic ApiDOM', function () {
    specify('should transform into S-expressions', function () {
      const contactElement = new ContactElement({
        name: 'name',
        url: 'url',
        email: 'email',
      });
      const licenseElement = new LicenseElement({
        name: 'name',
        identifier: 'identifier',
        url: 'url',
      });
      const semanticObj = new InfoElement({
        title: 'title',
        summary: 'summary',
        description: 'description',
        contact: contactElement,
        license: licenseElement,
        version: '1.0.0',
      });
      const expected = trim(dedent`
        (InfoElement
          (MemberElement
            (StringElement)
            (StringElement))
          (MemberElement
            (StringElement)
            (StringElement))
          (MemberElement
            (StringElement)
            (StringElement))
          (MemberElement
            (StringElement)
            (ContactElement
              (MemberElement
                (StringElement)
                (StringElement))
              (MemberElement
                (StringElement)
                (StringElement))
              (MemberElement
                (StringElement)
                (StringElement))))
          (MemberElement
            (StringElement)
            (LicenseElement
              (MemberElement
                (StringElement)
                (StringElement))
              (MemberElement
                (StringElement)
                (StringElement))
              (MemberElement
                (StringElement)
                (StringElement))))
          (MemberElement
            (StringElement)
            (StringElement)))`);

      assert.strictEqual(sexprs(semanticObj), expected);
    });
  });
});
