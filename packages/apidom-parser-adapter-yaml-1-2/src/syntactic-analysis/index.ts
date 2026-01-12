import { Tree } from 'web-tree-sitter';
import { ParseResultElement } from '@speclynx/apidom-datamodel';

import JsonSchema from './ast/schemas/json/index.ts';
import YamlReferenceManager from './ast/anchors-aliases/ReferenceManager.ts';
import transformCstToYamlAst from './CstTransformer.ts';
import { transformYamlAstToApiDOM } from './YamlAstTransformer.ts';

/**
 * @public
 */
export type { Tree };

/**
 * This version of syntactic analysis does following transformations:
 *   `TreeSitter CST -> YAML AST -> ApiDOM`
 * Two traversals passes are needed to get from CST to ApiDOM.
 * @public
 */
const analyze = (cst: Tree, { sourceMap = false } = {}): ParseResultElement => {
  const cursor = cst.walk();
  const schema = new JsonSchema();
  const referenceManager = new YamlReferenceManager();

  // Pass 1: CST -> YAML AST (direct cursor-based transformation)
  const yamlAst = transformCstToYamlAst(cursor, {
    schema,
    sourceMap,
    referenceManager,
  });

  // Pass 2: YAML AST -> ApiDOM (direct transformation)
  return transformYamlAstToApiDOM(yamlAst, { sourceMap });
};

export default analyze;
