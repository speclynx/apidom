import { keyMap as keyMapBase } from '@speclynx/apidom-core';

export { getNodeType } from '@speclynx/apidom-ns-json-schema-draft-4';

/**
 * @public
 */
export const keyMap = {
  JSONSchemaDraft6Element: ['content'],
  JSONReferenceElement: ['content'],
  MediaElement: ['content'],
  LinkDescriptionElement: ['content'],
  ...keyMapBase,
};
