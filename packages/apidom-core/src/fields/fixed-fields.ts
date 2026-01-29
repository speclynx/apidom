import { Element } from '@speclynx/apidom-datamodel';

/**
 * Represents a fixed field definition.
 * @public
 */
export interface FixedField {
  name: string;
  [key: string]: unknown;
}

/**
 * Options for the fixedFields function.
 * @public
 */
export interface FixedFieldsOptions {
  /**
   * When true, returns an object indexed by field name for O(1) lookups.
   */
  indexed?: boolean;
}

type ElementClass = typeof Element & {
  fixedFields?: FixedField[];
};

/**
 * Returns the fixed fields for an Element class or instance.
 *
 * @param elementOrClass - Element instance or class
 * @param options - Options for return format
 * @returns Array of fixed fields, or object indexed by name if options.indexed is true
 *
 * @example
 * ```ts
 * import { fixedFields } from '@speclynx/apidom-core';
 *
 * // Get fixed fields as array
 * const fields = fixedFields(ParameterElement);
 *
 * // Get fixed fields as indexed object for O(1) lookups
 * const fieldsIndex = fixedFields(ParameterElement, { indexed: true });
 * if ('description' in fieldsIndex) {
 *   // field exists
 * }
 * ```
 *
 * @public
 */
export function fixedFields(
  elementOrClass: Element | ElementClass,
  options: { indexed: true },
): Record<string, FixedField>;
export function fixedFields(
  elementOrClass: Element | ElementClass,
  options?: { indexed?: false },
): FixedField[];
export function fixedFields(
  elementOrClass: Element | ElementClass,
  options?: FixedFieldsOptions,
): FixedField[] | Record<string, FixedField> {
  const constructor = (
    elementOrClass instanceof Element ? elementOrClass.constructor : elementOrClass
  ) as ElementClass;

  const fields = constructor.fixedFields ?? [];

  if (options?.indexed) {
    return Object.fromEntries(fields.map((f) => [f.name, f]));
  }

  return fields;
}

export default fixedFields;
