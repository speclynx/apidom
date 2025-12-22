import { NotImplementedError } from '@speclynx/apidom-error';

/**
 * @public
 */
class MediaTypes<T> extends Array<T> {
  unknownMediaType = 'application/octet-stream';

  filterByFormat() {
    throw new NotImplementedError(
      'filterByFormat method in MediaTypes class is not yet implemented.',
    );
  }

  findBy() {
    throw new NotImplementedError('findBy method in MediaTypes class is not yet implemented.');
  }

  latest() {
    throw new NotImplementedError('latest method in MediaTypes class is not yet implemented.');
  }
}

export default MediaTypes;
