const fs = require('node:fs');
const path = require('node:path');

module.exports = function inlineWasm({ types: t }) {
  return {
    name: 'inline-wasm-as-uint8array',
    visitor: {
      ImportDeclaration(importPath, state) {
        const src = importPath.node.source.value;
        if (typeof src !== 'string' || !src.endsWith('.wasm')) return;

        // resolve the .wasm file (relative or in node_modules)
        let fullPath;
        try {
          fullPath = require.resolve(src, {
            paths: [path.dirname(state.file.opts.filename), process.cwd()],
          });
        } catch {
          fullPath = require.resolve(src, { paths: [process.cwd()] });
        }

        // read binary and turn into array of NumericLiterals
        const buffer = fs.readFileSync(fullPath);
        const byteLits = Array.from(buffer).map((b) => t.numericLiteral(b));

        // build: const <localName> = new Uint8Array([ … ]);
        const localId = importPath.node.specifiers[0].local;
        const arrExpr = t.newExpression(t.identifier('Uint8Array'), [t.arrayExpression(byteLits)]);
        const varDecl = t.variableDeclaration('const', [t.variableDeclarator(localId, arrExpr)]);

        importPath.replaceWith(varDecl);
      },
    },
  };
};
