import { mapObjIndexed, path, has, propSatisfies } from 'ramda';
import { isPlainObject, trimCharsStart, isString } from 'ramda-adjunct';

/**
 * Base type for resolved specification objects.
 * Extend this in namespace packages to add specific type information.
 * @public
 */
export interface ResolvedSpecification {
  elementMap: Record<string, string[]>;
}

const specCache = new WeakMap<object, Record<string, unknown>>();

/**
 * Resolves a specification object by:
 * 1. Dereferencing all $ref pointers
 * 2. Building elementMap from objects with `element` property
 * 3. Caching results for efficiency
 *
 * @public
 */
export const resolveSpecification = <T extends ResolvedSpecification = ResolvedSpecification>(
  specification: Record<string, unknown>,
): T => {
  if (specCache.has(specification)) {
    return specCache.get(specification)! as T;
  }

  const elementMap: Record<string, string[]> = {};

  const traverse = (
    obj: Record<string, unknown>,
    root: Record<string, unknown>,
    currentPath: string[],
  ): Record<string, unknown> => {
    // Collect element mapping
    if (typeof obj.element === 'string') {
      elementMap[obj.element] = obj.$visitor ? [...currentPath, '$visitor'] : currentPath;
    }

    return mapObjIndexed((val, key) => {
      const newPath = [...currentPath, key as string];

      if (isPlainObject(val) && has('$ref', val) && propSatisfies(isString, '$ref', val)) {
        const $ref = path(['$ref'], val);
        const pointer = trimCharsStart('#/', $ref as string);
        return path(pointer.split('/'), root);
      }
      if (isPlainObject(val)) {
        return traverse(val as Record<string, unknown>, root, newPath);
      }
      return val;
    }, obj);
  };

  const resolved = traverse(specification, specification, []);
  resolved.elementMap = elementMap;

  specCache.set(specification, resolved);
  return resolved as T;
};
