import { keyMap as keyMapBase } from '@speclynx/apidom-core';

export { getNodeType } from '@speclynx/apidom-ns-json-schema-draft-7';

/**
 * @public
 */
export const keyMap = {
  JSONSchema201909Element: ['content'],
  LinkDescriptionElement: ['content'],
  ...keyMapBase,
};
