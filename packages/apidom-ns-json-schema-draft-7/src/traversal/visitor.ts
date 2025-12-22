import { keyMap as keyMapBase } from '@speclynx/apidom-core';

export { getNodeType } from '@speclynx/apidom-ns-json-schema-draft-6';

/**
 * @public
 */
export const keyMap = {
  JSONSchemaDraft7Element: ['content'],
  JSONReferenceElement: ['content'],
  LinkDescriptionElement: ['content'],
  ...keyMapBase,
};
