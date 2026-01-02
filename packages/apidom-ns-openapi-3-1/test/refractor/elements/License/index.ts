import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractLicense } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('LicenseElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const licenseElement = refractLicense({
          name: 'Apache 2.0',
          identifier: 'Apache-2.0',
          url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
        });

        expect(sexprs(licenseElement)).toMatchSnapshot();
      });
    });
  });
});
