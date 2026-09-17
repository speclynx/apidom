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

/**
 * Computes the `$ref` value addressing an embedded JSON Schema resource from a
 * Schema Object whose base URI changes when it is relocated into the entry
 * document — one carried inside a hoisted Response, Parameter, Path Item, etc.
 * `$refURI` and `resourceURI` are as in `rebaseSchema$ref`; `baseURI` is the
 * base the `$ref` resolves against after relocation.
 *
 * A resource that identifies itself (`isResourceIdentified`, i.e. it declares a
 * `$id`) is addressed by that `$id`, exactly as `rebaseSchema$ref` does. A
 * resource identified only by its retrieval URI is addressed by a URI reference
 * relative to `baseURI`: it then resolves to the `$id` assigned from that
 * retrieval URI wherever the bundle is placed, and no absolute retrieval
 * location leaks into the `$ref`. The `$anchor` or JSON Pointer fragment is
 * kept in both cases.
 *
 * @public
 */
export const relocateSchema$ref = (
  $refURI: string,
  resourceURI: string,
  baseURI: string,
  isResourceIdentified: boolean,
): string => {
  const target = isResourceIdentified ? resourceURI : url.relative(baseURI, resourceURI);
  const fragment = url.getHash($refURI);
  return fragment === '#' ? target : `${target}${fragment}`;
};
