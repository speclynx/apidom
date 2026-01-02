import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractLinkDescription } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('LinkDescription', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const linkDescriptionElement = refractLinkDescription({
          href: 'base64',
          hrefSchema: {},
          rel: 'image/png',
          title: 'title',
          targetSchema: {},
          mediaType: 'text/html',
          submissionEncType: 'application/x-www-form-urlencoded',
          submissionSchema: {},
        });

        expect(sexprs(linkDescriptionElement)).toMatchSnapshot();
      });
    });
  });
});
