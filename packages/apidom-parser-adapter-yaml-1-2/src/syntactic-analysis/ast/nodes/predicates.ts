import YamlScalar from './YamlScalar.ts';
import YamlMapping from './YamlMapping.ts';
import YamlSequence from './YamlSequence.ts';
import YamlAlias from './YamlAlias.ts';
import YamlKeyValuePair from './YamlKeyValuePair.ts';
import YamlDocument from './YamlDocument.ts';
import YamlComment from './YamlComment.ts';

export const isScalar = (node: unknown): node is YamlScalar => node instanceof YamlScalar;
export const isMapping = (node: unknown): node is YamlMapping => node instanceof YamlMapping;
export const isSequence = (node: unknown): node is YamlSequence => node instanceof YamlSequence;
export const isAlias = (node: unknown): node is YamlAlias => node instanceof YamlAlias;
export const isKeyValuePair = (node: unknown): node is YamlKeyValuePair =>
  node instanceof YamlKeyValuePair;
export const isDocument = (node: unknown): node is YamlDocument => node instanceof YamlDocument;
export const isComment = (node: unknown): node is YamlComment => node instanceof YamlComment;
