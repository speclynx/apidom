import { last } from 'ramda';
import { MediaTypes } from '@speclynx/apidom-core';

/**
 * @public
 */
export type Format = 'generic' | 'json' | 'yaml';

/**
 * @public
 */
export class OverlayMediaTypes extends MediaTypes<string> {
  filterByFormat(format: Format = 'generic') {
    const effectiveFormat = format === 'generic' ? 'overlay;version' : format;
    return this.filter((mediaType) => mediaType.includes(effectiveFormat));
  }

  findBy(version = '1.1.0', format: Format = 'generic') {
    const search =
      format === 'generic'
        ? `vnd.oai.overlay;version=${version}`
        : `vnd.oai.overlay+${format};version=${version}`;
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
const mediaTypes = new OverlayMediaTypes(
  'application/vnd.oai.overlay;version=1.0.0',
  'application/vnd.oai.overlay+json;version=1.0.0',
  'application/vnd.oai.overlay+yaml;version=1.0.0',
  'application/vnd.oai.overlay;version=1.1.0',
  'application/vnd.oai.overlay+json;version=1.1.0',
  'application/vnd.oai.overlay+yaml;version=1.1.0',
);

export default mediaTypes;
