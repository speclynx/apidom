import path from 'node:path';
import { assert } from 'chai';
import { mediaTypes, ReferenceElement } from '@speclynx/apidom-ns-openapi-3-1';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { fileURLToPath } from 'node:url';

import { resolve, resolveApiDOM, parse } from '../../src/index.ts';
import FileResolver from '../../src/resolve/resolvers/file/index-node.ts';
import UnmatchedResolveStrategyError from '../../src/errors/UnmatchedResolveStrategyError.ts';
import ResolveError from '../../src/errors/ResolveError.ts';
import ParseError from '../../src/errors/ParseError.ts';
import OpenAPIJSON3_1Parser from '../../src/parse/parsers/openapi-json-3-1/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fixturePath = path.join(
  __dirname,
  'strategies',
  'openapi-3-1',
  'reference-object',
  'fixtures',
  'internal-external',
);

describe('resolve', function () {
  const rootFilePath = path.join(fixturePath, 'root.json');

  context('should export functions', function () {
    context('resolve', function () {
      specify('should resolve a file', async function () {
        const refSet = await resolve(rootFilePath, {
          parse: { mediaType: mediaTypes.latest('json') },
        });

        assert.strictEqual(refSet.size, 2);
      });

      specify('should match the media type per RFC 9110', async function () {
        const refSet = await resolve(rootFilePath, {
          parse: { mediaType: 'Application/OpenAPI+JSON; Version=3.1.2; charset=utf-8' },
        });

        assert.strictEqual(refSet.size, 2);
      });
    });

    context('resolveApiDOM', function () {
      context('given fragment is instance of ParseResultElement', function () {
        specify('should resolve an ApiDOM fragment', async function () {
          const fragment = await parse(rootFilePath, {
            parse: { mediaType: mediaTypes.latest('json') },
          });
          const refSet = await resolveApiDOM(fragment, {
            resolve: { baseURI: rootFilePath },
          });

          assert.strictEqual(refSet.size, 2);
        });
      });

      context("given fragment isn't instance of ParseResultElement", function () {
        specify('should resolve an ApiDOM fragment', async function () {
          const { api } = await parse(rootFilePath, {
            parse: { mediaType: mediaTypes.latest('json') },
          });
          // @ts-ignore
          const refSet = await resolveApiDOM(api, {
            resolve: { baseURI: rootFilePath },
          });

          assert.strictEqual(refSet.size, 2);
        });
      });
    });
  });

  context('given URI with dot segments', function () {
    // path.join would remove the dot segments
    const nonNormalizedURI = `${fixturePath}/../internal-external/root.json`;

    specify('should key the root document with normalized URI', async function () {
      const refSet = await resolve(nonNormalizedURI, {
        parse: { mediaType: mediaTypes.latest('json') },
      });

      assert.strictEqual(refSet.size, 2);
      assert.strictEqual(refSet.rootRef?.uri, rootFilePath);
    });

    specify('should resolve an ApiDOM fragment', async function () {
      const fragment = await parse(rootFilePath, {
        parse: { mediaType: mediaTypes.latest('json') },
      });
      const refSet = await resolveApiDOM(fragment, {
        resolve: { baseURI: nonNormalizedURI },
      });

      assert.strictEqual(refSet.size, 2);
      assert.strictEqual(refSet.rootRef?.uri, rootFilePath);
    });
  });

  context('given URI with fragment', function () {
    specify('should key the root document without the fragment', async function () {
      const refSet = await resolve(`${rootFilePath}#/components`, {
        parse: { mediaType: mediaTypes.latest('json') },
      });

      assert.strictEqual(refSet.size, 2);
      assert.strictEqual(refSet.rootRef?.uri, rootFilePath);
    });
  });

  context('given lone element and baseURI with fragment', function () {
    const rootPath = path.join(__dirname, 'fixtures', 'lone-element', 'root.json');
    const baseURI = `${rootPath}#/components/parameters/lone`;
    const resolveLone = async () => {
      const parseResult = await parse(rootPath, {
        parse: { mediaType: mediaTypes.latest('json') },
      });
      const referenceElement = evaluate<ReferenceElement>(
        parseResult.api!,
        '/components/parameters/lone',
      );

      return resolveApiDOM(referenceElement, {
        parse: { mediaType: mediaTypes.latest('json') },
        resolve: { baseURI },
      });
    };

    specify('should key the lone element with the fragment', async function () {
      const refSet = await resolveLone();

      assert.strictEqual(refSet.rootRef?.uri, baseURI);
    });

    specify(
      'should resolve a reference back to the document of the lone element',
      async function () {
        const refSet = await resolveLone();

        assert.isTrue(refSet.has(rootPath));
      },
    );
  });

  context('given URI with hash', function () {
    specify('should resolve the file', async function () {
      const uri = path.join(
        __dirname,
        'strategies',
        'openapi-3-1',
        'reference-object',
        'fixtures',
        'external-indirections',
        'root.json',
      );
      const refSet = await resolve(uri, {
        parse: { mediaType: mediaTypes.latest('json') },
      });

      assert.strictEqual(refSet.size, 4);
    });
  });

  context('given URI with unknown file extension', function () {
    context('and matching binary parser', function () {
      specify('should throw error', async function () {
        const uri = path.join(__dirname, 'fixtures', 'unknown-extension.ext');

        try {
          await resolve(uri);
          assert.fail('Should throw UnmatchedResolveStrategyError');
        } catch (error) {
          assert.instanceOf(error, UnmatchedResolveStrategyError);
        }
      });
    });
  });

  context('given URI with unknown media type', function () {
    context('and no matching resolve strategies', function () {
      specify('should throw error', async function () {
        const uri = path.join(
          __dirname,
          'strategies',
          'openapi-3-1',
          'reference-object',
          'fixtures',
          'external-indirections',
          'root.json',
        );
        const options = {
          resolve: {
            strategies: [],
          },
        };

        try {
          await resolve(uri, options);
          assert.fail('Should throw UnmatchedResolveStrategyError');
        } catch (error) {
          assert.instanceOf(error, UnmatchedResolveStrategyError);
        }
      });
    });
  });

  context('given URI with non existing file', function () {
    specify('should throw error', async function () {
      const uri = '/path/to/non-existing-file.json';
      const options = {
        parse: { mediaType: mediaTypes.latest('json') },
      };

      try {
        await resolve(uri, options);
        assert.fail('Should throw ResolveError');
      } catch (error) {
        assert.instanceOf(error, ResolveError);
      }
    });
  });

  context('given file allow list is provided as resolver option', function () {
    specify('should resolve the file', async function () {
      const uri = path.join(
        __dirname,
        'strategies',
        'openapi-3-1',
        'reference-object',
        'fixtures',
        'external-indirections',
        'root.json',
      );
      const refSet = await resolve(uri, {
        parse: { mediaType: mediaTypes.latest('json') },
        resolve: {
          resolvers: [new FileResolver()],
          resolverOpts: {
            fileAllowList: ['*'],
          },
        },
      });

      assert.strictEqual(refSet.size, 4);
    });
  });

  context("given suitable parser doesn't allow empty files", function () {
    specify('should throw error', async function () {
      const uri = path.join(__dirname, 'fixtures', 'empty-openapi-3-1-api.json');
      const options = {
        parse: {
          mediaType: mediaTypes.latest('json'),
          parsers: [new OpenAPIJSON3_1Parser({ allowEmpty: false })],
        },
      };

      try {
        await resolve(uri, options);
        assert.fail('Should throw ParseError');
      } catch (error: any) {
        assert.instanceOf(error, ParseError);
        assert.match(error.message, /file is empty$/);
      }
    });
  });

  context('given parser plugin throws error', function () {
    const parser = {
      allowEmpty: true,
      sourceMaps: false,
      canParse() {
        return true;
      },
      parse() {
        throw Error('I will not parse anything!');
      },
    };

    specify('should throw error', async function () {
      const uri = path.join(__dirname, 'fixtures', 'sample-openapi-3-1-api.json');
      const options = {
        parse: {
          mediaType: mediaTypes.latest('json'),
          parsers: [parser],
        },
      };

      try {
        await resolve(uri, options);
        assert.fail('Should throw ParseError');
      } catch (error) {
        assert.instanceOf(error, ParseError);
      }
    });
  });
});
