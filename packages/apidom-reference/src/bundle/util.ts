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
