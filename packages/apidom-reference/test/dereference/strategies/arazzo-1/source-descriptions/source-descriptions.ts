import path from 'node:path';
import { assert } from 'chai';
import { ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { fileURLToPath } from 'node:url';

import { dereferenceSourceDescriptions } from '../../../../../src/dereference/strategies/arazzo-1/index.ts';
import { options, mergeOptions, parse } from '../../../../../src/configuration/saturated.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('dereference', function () {
  context('dereferenceSourceDescriptions', function () {
    specify('should dereference source descriptions from ParseResult', async function () {
      const uri = path.join(__dirname, 'fixtures', 'root.json');
      const parseResult = await parse(uri);

      const sourceDescriptions = await dereferenceSourceDescriptions(parseResult, uri, options);

      assert.strictEqual(sourceDescriptions.length, 1);

      const sdParseResult = sourceDescriptions[0]!;
      assert.isTrue(isParseResultElement(sdParseResult));
      assert.isTrue(sdParseResult.classes.includes('source-description'));
      assert.strictEqual(sdParseResult.meta.get('name')!.toValue(), 'petStore');
      assert.strictEqual(sdParseResult.meta.get('type')!.toValue(), 'openapi');
    });

    specify('should filter source descriptions by name', async function () {
      const uri = path.join(__dirname, 'fixtures', 'root-multi.json');
      const parseResult = await parse(uri);

      const sourceDescriptions = await dereferenceSourceDescriptions(
        parseResult,
        uri,
        mergeOptions(options, {
          dereference: { strategyOpts: { sourceDescriptions: ['petStore'] } },
        }),
      );

      assert.strictEqual(sourceDescriptions.length, 1);

      const sdParseResult = sourceDescriptions[0]! as ParseResultElement;
      assert.isTrue(isParseResultElement(sdParseResult));
      assert.strictEqual(sdParseResult.meta.get('name')!.toValue(), 'petStore');
    });

    specify('should respect sourceDescriptionsMaxDepth option', async function () {
      const uri = path.join(__dirname, 'fixtures', 'root-recursive.json');
      const parseResult = await parse(uri);

      const sourceDescriptions = await dereferenceSourceDescriptions(
        parseResult,
        uri,
        mergeOptions(options, {
          dereference: { strategyOpts: { sourceDescriptionsMaxDepth: 1 } },
        }),
      );

      assert.strictEqual(sourceDescriptions.length, 1);

      const nestedArazzo = sourceDescriptions[0]! as ParseResultElement;
      assert.isTrue(isParseResultElement(nestedArazzo));
      assert.isTrue(nestedArazzo.classes.includes('source-description'));
      // nested arazzo has its API + error annotation for max depth exceeded
      assert.strictEqual(nestedArazzo.length, 2);

      const annotationResult = nestedArazzo.get(1)! as ParseResultElement;
      assert.isTrue(isParseResultElement(annotationResult));
      const annotation = annotationResult.get(0);
      assert.strictEqual(annotation?.element, 'annotation');
      assert.isTrue(annotation?.classes.includes('error'));
      assert.include(annotation?.toValue(), 'Maximum dereference depth of 1 has been exceeded');
    });

    specify('should allow overriding strategyName parameter for filtering', async function () {
      const uri = path.join(__dirname, 'fixtures', 'root-multi.json');
      const parseResult = await parse(uri);

      // use custom strategy name for options lookup with filtering
      const sourceDescriptions = await dereferenceSourceDescriptions(
        parseResult,
        uri,
        mergeOptions(options, {
          dereference: {
            strategyOpts: { 'custom-strategy': { sourceDescriptions: ['petStore'] } },
          },
        }),
        'custom-strategy',
      );

      assert.strictEqual(sourceDescriptions.length, 1);
      assert.isTrue(isParseResultElement(sourceDescriptions[0]));
      assert.strictEqual(sourceDescriptions[0]!.meta.get('name')!.toValue(), 'petStore');
    });

    specify('should default to arazzo-1 strategyName for filtering lookup', async function () {
      const uri = path.join(__dirname, 'fixtures', 'root-multi.json');
      const parseResult = await parse(uri);

      // only set strategy-specific option for filtering
      const sourceDescriptions = await dereferenceSourceDescriptions(
        parseResult,
        uri,
        mergeOptions(options, {
          dereference: { strategyOpts: { 'arazzo-1': { sourceDescriptions: ['petStore'] } } },
        }),
      );

      assert.strictEqual(sourceDescriptions.length, 1);

      const sdParseResult = sourceDescriptions[0]!;
      assert.isTrue(isParseResultElement(sdParseResult));
      assert.isTrue(sdParseResult.classes.includes('source-description'));
      assert.strictEqual(sdParseResult.meta.get('name')!.toValue(), 'petStore');
    });

    specify('should attach parseResult to source description element meta', async function () {
      const uri = path.join(__dirname, 'fixtures', 'root.json');
      const parseResult = await parse(uri);

      await dereferenceSourceDescriptions(parseResult, uri, options);

      // verify meta is set on source description element
      const api: any = parseResult.api!;
      const sourceDescriptions = api.get('sourceDescriptions');
      const sourceDesc = sourceDescriptions.get(0);
      const attachedParseResult = sourceDesc.meta.get('parseResult') as ParseResultElement;

      assert.isTrue(isParseResultElement(attachedParseResult));
      assert.strictEqual(attachedParseResult.api?.element, 'openApi3_1');
    });

    specify('should reuse already-parsed source descriptions from meta', async function () {
      const uri = path.join(__dirname, 'fixtures', 'root.json');

      // first parse with sourceDescriptions: true
      const parseResult = await parse(uri, {
        parse: { parserOpts: { sourceDescriptions: true } },
      });

      // verify parse result is attached to source description element
      const api: any = parseResult.api!;
      const sourceDescriptions = api.get('sourceDescriptions');
      const sourceDesc = sourceDescriptions.get(0);
      const parsedDoc = sourceDesc.meta.get('parseResult');
      assert.isTrue(isParseResultElement(parsedDoc));

      // now dereference - should reuse the already-parsed source description (no re-fetch)
      const dereferencedResults = await dereferenceSourceDescriptions(parseResult, uri, options);

      assert.strictEqual(dereferencedResults.length, 1);

      // the dereferenced result should be attached (overwrites parsed result)
      const dereferencedDoc = sourceDesc.meta.get('parseResult') as ParseResultElement;
      assert.isTrue(isParseResultElement(dereferencedDoc));
      assert.strictEqual(dereferencedDoc.api?.element, 'openApi3_1');
    });
  });
});
