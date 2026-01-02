import { StringElement } from '@speclynx/apidom-datamodel';
import { LicenseElement } from '@speclynx/apidom-ns-openapi-3-0';

/**
 * @public
 */
class License extends LicenseElement {
  get identifier(): StringElement | undefined {
    return this.get('identifier') as StringElement | undefined;
  }

  set identifier(name: StringElement | undefined) {
    this.set('identifier', name);
  }
}

export default License;
