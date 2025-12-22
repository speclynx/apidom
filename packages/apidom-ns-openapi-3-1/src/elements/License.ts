import { StringElement } from '@speclynx/apidom-core';
import { LicenseElement } from '@speclynx/apidom-ns-openapi-3-0';

/**
 * @public
 */
class License extends LicenseElement {
  get identifier(): StringElement | undefined {
    return this.get('identifier');
  }

  set identifier(name: StringElement | undefined) {
    this.set('identifier', name);
  }
}

export default License;
