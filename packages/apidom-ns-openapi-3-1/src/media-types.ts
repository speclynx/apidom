import { last } from 'ramda';
import { MediaTypes } from '@speclynx/apidom-core';

/**
 * @public
 */
export type Format = 'generic' | 'json' | 'yaml';

/**
 * @public
 */
export class OpenAPIMediaTypes extends MediaTypes<string> {
  filterByFormat(format: Format = 'generic') {
    const effectiveFormat = format === 'generic' ? 'openapi;version' : format;
    return this.filter((mediaType) => mediaType.includes(effectiveFormat));
  }

  findBy(version = '3.1.2', format: Format = 'generic') {
    const search =
      format === 'generic' ? `openapi;version=${version}` : `openapi+${format};version=${version}`;
    const found = this.find((mediaType) => mediaType.includes(search));

    return found || this.unknownMediaType;
  }

  latest(format: Format = 'generic') {
    return last(this.filterByFormat(format)) as string;
  }
}

/**
 * @public
 */
const mediaTypes = new OpenAPIMediaTypes(
  'application/openapi;version=3.1.0',
  'application/openapi+json;version=3.1.0',
  'application/openapi+yaml;version=3.1.0',
  'application/openapi;version=3.1.1',
  'application/openapi+json;version=3.1.1',
  'application/openapi+yaml;version=3.1.1',
  'application/openapi;version=3.1.2',
  'application/openapi+json;version=3.1.2',
  'application/openapi+yaml;version=3.1.2',
);

export default mediaTypes;
