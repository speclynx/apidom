import * as url from '../util/url.ts';

/**
 * Upper-cases the first letter of each whitespace-separated word and joins
 * them, e.g. `pet model` -> `PetModel`.
 *
 * @public
 */
export const toPascalCase = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/^[a-z]/, (char) => char.toUpperCase()))
    .join('');

/**
 * Replaces characters that are invalid in a Components Object name with `-`,
 * then collapses repeated separators and trims leading/trailing ones.
 *
 * @public
 */
export const sanitizeComponentName = (value: string): string =>
  value
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Returns a collision-free name by suffixing `-2`, `-3`, ... onto `candidate`
 * until `isTaken` reports it free. `isTaken` decides what counts as taken
 * (e.g. names already placed in or reserved for a Components Object field).
 *
 * @public
 */
export const uniqueName = (candidate: string, isTaken: (name: string) => boolean): string => {
  if (!isTaken(candidate)) {
    return candidate;
  }

  let counter = 2;
  while (isTaken(`${candidate}-${counter}`)) {
    counter += 1;
  }
  return `${candidate}-${counter}`;
};

/**
 * Computes the `$ref` value addressing an embedded JSON Schema resource by its
 * canonical `$id`. `$refURI` is the `$ref` resolved against the referencing
 * document's base URI; `resourceURI` is the embedded resource's canonical URI
 * (its `$id`, or the retrieval URI when it has none).
 *
 * When the two differ — a location-based `$ref` (e.g. `./ex.json#/$defs/Pet`)
 * to a resource that identifies itself differently (`$id: https://example.com/pets`)
 * — the `$ref` is rebased onto the resource URI, keeping its `$anchor` or JSON
 * Pointer fragment. Once embedded, the resource is reachable only by its `$id`,
 * so an unchanged `$ref` would dangle. When they already agree, `undefined` is
 * returned and the `$ref` is to be left as written.
 *
 * This knowingly departs from the letter of JSON Schema 2020-12 §9.3.1
 * ("references ... MUST NOT be changed"), which presumes `$ref`s are written
 * against `$id`s. The target schema — and thus evaluation output — is unchanged;
 * only the alias the loader knew the resource by is normalized to its canonical URI.
 *
 * @public
 */
export const rebaseSchema$ref = ($refURI: string, resourceURI: string): string | undefined => {
  if (url.stripHash($refURI) === resourceURI) {
    return undefined;
  }

  const fragment = url.getHash($refURI);
  return fragment === '#' ? resourceURI : `${resourceURI}${fragment}`;
};
