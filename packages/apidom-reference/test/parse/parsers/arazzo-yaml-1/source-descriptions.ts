import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import { ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { parse } from '@speclynx/apidom-parser-adapter-arazzo-yaml-1';
import { fileURLToPath } from 'node:url';

import { parseSourceDescriptions } from '../../../../src/parse/parsers/arazzo-yaml-1/index.ts';
import { options, mergeOptions } from '../../../../src/configuration/saturated.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('parsers', function () {
  context('parseSourceDescriptions', function () {
    context('given naked parser adapter usage', function () {
      specify('should parse source descriptions from ParseResult', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.yaml');
        const data = fs.readFileSync(uri).toString();

        // use naked parser adapter directly
        const parseResult = await parse(data);

        // use exported parseSourceDescriptions function
        const sourceDescriptions = await parseSourceDescriptions(parseResult, uri, options);

        assert.strictEqual(sourceDescriptions.length, 1);

        const sdParseResult = sourceDescriptions[0]!;
        assert.isTrue(isParseResultElement(sdParseResult));
        assert.isTrue(sdParseResult.classes.includes('source-description'));
        assert.strictEqual(sdParseResult.meta.get('name'), 'petStore');
        assert.strictEqual(sdParseResult.meta.get('type'), 'openapi');
      });

      specify('should filter source descriptions by name', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions-filter', 'root.yaml');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            parse: { parserOpts: { sourceDescriptions: ['petStore', 'paymentApi'] } },
          }),
        );

        assert.strictEqual(sourceDescriptions.length, 2);

        const petStoreResult = sourceDescriptions[0]! as ParseResultElement;
        assert.isTrue(isParseResultElement(petStoreResult));
        assert.strictEqual(petStoreResult.meta.get('name'), 'petStore');

        const paymentResult = sourceDescriptions[1]! as ParseResultElement;
        assert.isTrue(isParseResultElement(paymentResult));
        assert.strictEqual(paymentResult.meta.get('name'), 'paymentApi');
      });

      specify('should respect sourceDescriptionsMaxDepth option', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions-recursive', 'root.yaml');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            parse: { parserOpts: { sourceDescriptionsMaxDepth: 1 } },
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
        assert.include(annotation?.toValue(), 'Maximum parse depth of 1 has been exceeded');
      });

      specify('should allow overriding parserName parameter for filtering', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions-filter', 'root.yaml');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        // use custom parser name for options lookup with filtering
        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            parse: { parserOpts: { 'custom-parser': { sourceDescriptions: ['petStore'] } } },
          }),
          'custom-parser',
        );

        assert.strictEqual(sourceDescriptions.length, 1);
        assert.isTrue(isParseResultElement(sourceDescriptions[0]));
        assert.strictEqual(sourceDescriptions[0]!.meta.get('name'), 'petStore');
      });

      specify('should default to arazzo-yaml-1 parserName for filtering lookup', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions-filter', 'root.yaml');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        // only set parser-specific option for filtering
        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            parse: { parserOpts: { 'arazzo-yaml-1': { sourceDescriptions: ['petStore'] } } },
          }),
        );

        assert.strictEqual(sourceDescriptions.length, 1);

        const sdParseResult = sourceDescriptions[0]!;
        assert.isTrue(isParseResultElement(sdParseResult));
        assert.isTrue(sdParseResult.classes.includes('source-description'));
        assert.strictEqual(sdParseResult.meta.get('name'), 'petStore');
      });

      specify('should attach parseResult to source description element meta', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.yaml');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        await parseSourceDescriptions(parseResult, uri, options);

        // verify meta is set on source description element
        const api: any = parseResult.api!;
        const sourceDescriptions = api.get('sourceDescriptions');
        const sourceDesc = sourceDescriptions.get(0);
        const attachedParseResult = sourceDesc.meta.get('parseResult') as ParseResultElement;

        assert.isTrue(isParseResultElement(attachedParseResult));
        assert.strictEqual(attachedParseResult.api?.element, 'openApi3_1');
      });

      specify(
        'should parse a shared document once and point later references at it',
        async function () {
          const uri = path.join(__dirname, 'fixtures', 'source-descriptions-shared', 'root.yaml');
          const data = fs.readFileSync(uri).toString();
          const parseResult = await parse(data);

          const sourceDescriptions = await parseSourceDescriptions(parseResult, uri, options);

          assert.strictEqual(sourceDescriptions.length, 2);

          const petStore = sourceDescriptions[0]! as ParseResultElement;
          assert.strictEqual(petStore.api?.element, 'openApi3_1');

          // nested reaches the same OpenAPI document through a different path (diamond)
          const nested = sourceDescriptions[1]! as ParseResultElement;
          assert.strictEqual(nested.length, 3);

          const petStoreApi = nested.get(1)! as ParseResultElement;
          assert.isTrue(isParseResultElement(petStoreApi));
          assert.isTrue(petStoreApi.classes.includes('source-description'));
          assert.strictEqual(petStoreApi.meta.get('name'), 'petStoreApi');
          assert.strictEqual(
            petStoreApi.meta.get('retrievalURI'),
            petStore.meta.get('retrievalURI'),
          );
          assert.isUndefined(petStoreApi.api); // not parsed again
          assert.strictEqual(petStoreApi.warnings.length, 0); // not a cycle
          assert.strictEqual(petStoreApi.meta.get('parseResult'), petStore);

          const annotation = petStoreApi.get(0);
          assert.strictEqual(annotation?.element, 'annotation');
          assert.isTrue(annotation?.classes.includes('info'));
          assert.include(annotation?.toValue(), 'has already been parsed');

          // source description element points at the result where the document was parsed
          const nestedApi: any = nested.api!;
          const sourceDesc = nestedApi.get('sourceDescriptions').get(0);
          assert.strictEqual(sourceDesc.meta.get('parseResult'), petStore);

          // reference back to root is still a cycle
          const root = nested.get(2)! as ParseResultElement;
          assert.isUndefined(root.api);
          assert.isUndefined(root.meta.get('parseResult'));
          assert.isTrue(root.get(0)?.classes.includes('warning'));
          assert.include(root.get(0)?.toValue(), 'has already been visited');
        },
      );
    });
  });
});
