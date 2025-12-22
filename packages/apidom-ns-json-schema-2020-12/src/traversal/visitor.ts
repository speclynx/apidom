import { keyMap as keyMapBase } from '@speclynx/apidom-core';

export { getNodeType } from '@speclynx/apidom-ns-json-schema-2019-09';
/**
 * @public
 */
export const keyMap = {
  JSONSchema202012Element: ['content'],
  LinkDescriptionElement: ['content'],
  ...keyMapBase,
};
