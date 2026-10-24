import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import { isParseResultElement, ParseResultElement } from '@speclynx/apidom-datamodel';
import { toJSON } from '@speclynx/apidom-core';
import { mediaTypes, Overlay1Element } from '@speclynx/apidom-ns-overlay-1';
import { isOpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

import { dereference, dereferenceApiDOM } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFixturePath = path.join(__dirname, 'fixtures');

describe('dereference', function () {
  context('strategies', function () {
    context('overlay-1', function () {
      context('extends', function () {
        context('given extends enabled', function () {
          specify('should dereference extends target document', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 2);

            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(extendsResult));
            assert.isTrue(extendsResult.classes.includes('extends'));
          });

          specify('should set retrievalURI metadata on extends result', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            const retrievalURI = extendsResult.meta.get('retrievalURI');

            assert.isString(retrievalURI);
            assert.include(retrievalURI, 'openapi.json');
          });

          specify('should attach dereferenced result to extends element meta', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            const api = dereferenceResult.api as Overlay1Element;
            const extendsElement = api.get('extends')!;
            const parsedDoc = extendsElement.meta.get('parseResult');

            assert.isTrue(isParseResultElement(parsedDoc));
          });

          specify('should dereference $refs in the extends target document', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;

            expect(toJSON(extendsResult.api!, undefined, 2)).toMatchSnapshot();
          });
        });

        context('given $self field', function () {
          specify('should resolve extends against $self', async function () {
            const uri = path.join(rootFixturePath, 'self', 'overlays', 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });
            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            const expectedURI = path.join(rootFixturePath, 'self', 'specs', 'openapi.json');

            assert.strictEqual(extendsResult.meta.get('retrievalURI'), expectedURI);
            assert.isTrue(isOpenApi3_1Element(extendsResult.api));
          });
        });

        context('given extends resolving to the Overlay itself', function () {
          specify('should skip the extends target to prevent cycle', async function () {
            const uri = path.join(rootFixturePath, 'overlay-self-extends.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            assert.strictEqual(dereferenceResult.length, 2);

            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(extendsResult.classes.includes('extends'));
            assert.strictEqual(extendsResult.length, 1);

            const annotation = extendsResult.get(0)!;
            assert.strictEqual(annotation.element, 'annotation');
            assert.isTrue(annotation.classes.includes('warning'));
            assert.strictEqual(
              annotation.toValue(),
              `Extends target "${uri}" has already been visited. Skipping to prevent cycle`,
            );
          });
          specify('should skip the extends target of a YAML Overlay', async function () {
            const uri = path.join(rootFixturePath, 'overlay-self-extends.yaml');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('yaml') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            assert.strictEqual(extendsResult.length, 1);
            assert.isTrue(extendsResult.get(0)!.classes.includes('warning'));
          });
        });

        context('given Overlays extending each other', function () {
          const assertCycleSkipped = (dereferenceResult: ParseResultElement, uri: string) => {
            assert.strictEqual(dereferenceResult.length, 2);

            // overlay-cycle-a.json extends overlay-cycle-b.json
            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            assert.include(extendsResult.meta.get('retrievalURI'), 'overlay-cycle-b.json');
            assert.strictEqual(extendsResult.length, 2);

            // overlay-cycle-b.json extends overlay-cycle-a.json, which is skipped
            const nestedExtendsResult = extendsResult.get(1)! as ParseResultElement;
            assert.isTrue(nestedExtendsResult.classes.includes('extends'));
            assert.strictEqual(nestedExtendsResult.meta.get('retrievalURI'), uri);
            assert.strictEqual(nestedExtendsResult.length, 1);
            assert.isTrue(nestedExtendsResult.get(0)!.classes.includes('warning'));
          };

          specify(
            'should dereference the cycle once and skip the repeated target',
            async function () {
              const uri = path.join(rootFixturePath, 'overlay-cycle-a.json');
              const dereferenceResult = await dereference(uri, {
                parse: { mediaType: mediaTypes.latest('json') },
                dereference: {
                  strategyOpts: {
                    'overlay-1': { extends: true },
                  },
                },
              });

              assertCycleSkipped(dereferenceResult, uri);
            },
          );

          specify('should skip the repeated target via dereferenceApiDOM', async function () {
            const uri = path.join(rootFixturePath, 'overlay-cycle-a.json');
            const parseResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            const dereferenceResult = await dereferenceApiDOM(parseResult, {
              resolve: { baseURI: uri },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            assertCycleSkipped(dereferenceResult, uri);
          });

          specify(
            'should skip the repeated target with extends enabled on both parser and dereference',
            async function () {
              const uri = path.join(rootFixturePath, 'overlay-cycle-a.json');
              const dereferenceResult = await dereference(uri, {
                parse: {
                  mediaType: mediaTypes.latest('json'),
                  parserOpts: {
                    'overlay-json-1': { extends: true },
                  },
                },
                dereference: {
                  strategyOpts: {
                    'overlay-1': { extends: true },
                  },
                },
              });

              assertCycleSkipped(dereferenceResult, uri);
            },
          );
        });

        context('given extends disabled', function () {
          specify('should not dereference extends target document', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 1);
          });
        });

        context('given extends explicitly set to false', function () {
          specify('should not dereference extends target document', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: false },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 1);
          });
        });

        context('given extends enabled on both parser and dereference', function () {
          specify('should not produce duplicate extends results', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            const dereferenceResult = await dereference(uri, {
              parse: {
                mediaType: mediaTypes.latest('json'),
                parserOpts: {
                  'overlay-json-1': { extends: true },
                },
              },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            // should have exactly 2 elements (overlay API + single extends result), not 3
            assert.strictEqual(dereferenceResult.length, 2);

            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(extendsResult));
            assert.isTrue(extendsResult.classes.includes('extends'));
          });
        });

        context('given dereferenceApiDOM with pre-parsed overlay', function () {
          specify('should dereference extends target document', async function () {
            const uri = path.join(rootFixturePath, 'overlay.json');
            // first parse, then dereference via dereferenceApiDOM
            const parseResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
            });
            // parseResult has no extends yet (dereference.strategyOpts.extends was not set)
            assert.strictEqual(parseResult.length, 1);

            const dereferenceResult = await dereferenceApiDOM(parseResult, {
              resolve: { baseURI: uri },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 2);

            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(extendsResult));
            assert.isTrue(extendsResult.classes.includes('extends'));
          });

          specify(
            'should not produce duplicate extends results when parse phase already resolved extends',
            async function () {
              const uri = path.join(rootFixturePath, 'overlay.json');
              // parse with extends: true (parse phase resolves extends)
              const parseResult = await dereference(uri, {
                parse: {
                  mediaType: mediaTypes.latest('json'),
                  parserOpts: {
                    'overlay-json-1': { extends: true },
                  },
                },
              });
              // parseResult already has extends from parse phase
              assert.strictEqual(parseResult.length, 2);

              const dereferenceResult = await dereferenceApiDOM(parseResult, {
                resolve: { baseURI: uri },
                dereference: {
                  strategyOpts: {
                    'overlay-1': { extends: true },
                  },
                },
              });

              assert.isTrue(isParseResultElement(dereferenceResult));
              // should still have exactly 2 elements, not 3
              assert.strictEqual(dereferenceResult.length, 2);

              const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
              assert.isTrue(isParseResultElement(extendsResult));
              assert.isTrue(extendsResult.classes.includes('extends'));
            },
          );
        });

        context('given overlay without extends field', function () {
          specify('should not produce extends result', async function () {
            const uri = path.join(rootFixturePath, 'overlay-no-extends.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 1);
          });
        });

        context('given extends target that cannot be resolved', function () {
          specify('should attach error parse result to extends element meta', async function () {
            const uri = path.join(rootFixturePath, 'overlay-bad-extends.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            assert.isTrue(isParseResultElement(dereferenceResult));
            assert.strictEqual(dereferenceResult.length, 2);

            // extends result should contain error annotation
            const extendsResult = dereferenceResult.get(1)! as ParseResultElement;
            assert.isTrue(isParseResultElement(extendsResult));
            assert.isTrue(extendsResult.classes.includes('extends'));

            const annotation = extendsResult.get(0);
            assert.strictEqual(annotation?.element, 'annotation');
            assert.isTrue(annotation?.classes.includes('error'));
          });

          specify('should always set parseResult on extends element meta', async function () {
            const uri = path.join(rootFixturePath, 'overlay-bad-extends.json');
            const dereferenceResult = await dereference(uri, {
              parse: { mediaType: mediaTypes.latest('json') },
              dereference: {
                strategyOpts: {
                  'overlay-1': { extends: true },
                },
              },
            });

            const api = dereferenceResult.api as Overlay1Element;
            const extendsElement = api.get('extends')!;
            const attachedResult = extendsElement.meta.get('parseResult') as ParseResultElement;

            assert.isTrue(isParseResultElement(attachedResult));
            assert.isTrue(attachedResult.classes.includes('extends'));

            const annotation = attachedResult.get(0);
            assert.strictEqual(annotation?.element, 'annotation');
            assert.isTrue(annotation?.classes.includes('error'));
          });
        });
      });
    });
  });
});
