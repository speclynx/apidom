import { StringElement } from '@speclynx/apidom-datamodel';
import { InfoElement } from '@speclynx/apidom-ns-openapi-3-0';

import LicenseElement from './License.ts';

/**
 * @public
 */
class Info extends InfoElement {
  get license(): LicenseElement | undefined {
    return this.get('license') as LicenseElement | undefined;
  }

  set license(licenseElement: LicenseElement | undefined) {
    this.set('license', licenseElement);
  }

  get summary(): StringElement | undefined {
    return this.get('summary') as StringElement | undefined;
  }

  set summary(summary: StringElement | undefined) {
    this.set('summary', summary);
  }
}

export default Info;
