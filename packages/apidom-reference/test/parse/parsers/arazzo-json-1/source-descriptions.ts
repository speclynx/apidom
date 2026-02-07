import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import { ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { parse } from '@speclynx/apidom-parser-adapter-arazzo-json-1';
import { fileURLToPath } from 'node:url';

import { parseSourceDescriptions } from '../../../../src/parse/parsers/arazzo-json-1/index.ts';
import { options, mergeOptions } from '../../../../src/configuration/saturated.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('parsers', function () {
  context('parseSourceDescriptions', function () {
    context('given naked parser adapter usage', function () {
      specify('should parse source descriptions from ParseResult', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
        const data = fs.readFileSync(uri).toString();

        // use naked parser adapter directly
        const parseResult = await parse(data);

        // use exported parseSourceDescriptions function
        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, { parse: { parserOpts: { sourceDescriptions: true } } }),
        );

        assert.strictEqual(sourceDescriptions.length, 1);

        const sdParseResult = sourceDescriptions[0]!;
        assert.isTrue(isParseResultElement(sdParseResult));
        assert.isTrue(sdParseResult.classes.includes('source-description'));
        assert.strictEqual(sdParseResult.meta.get('name')!.toValue(), 'petStore');
        assert.strictEqual(sdParseResult.meta.get('type')!.toValue(), 'openapi');
      });

      specify('should filter source descriptions by name', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions-filter', 'root.json');
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
        assert.strictEqual(petStoreResult.meta.get('name')!.toValue(), 'petStore');

        const paymentResult = sourceDescriptions[1]! as ParseResultElement;
        assert.isTrue(isParseResultElement(paymentResult));
        assert.strictEqual(paymentResult.meta.get('name')!.toValue(), 'paymentApi');
      });

      specify('should respect sourceDescriptionsMaxDepth option', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions-recursive', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            parse: { parserOpts: { sourceDescriptions: true, sourceDescriptionsMaxDepth: 1 } },
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

      specify('should return empty array when sourceDescriptions is false', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, { parse: { parserOpts: { sourceDescriptions: false } } }),
        );

        assert.strictEqual(sourceDescriptions.length, 0);
      });

      specify('should allow overriding parserName parameter', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        // use custom parser name for options lookup
        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            parse: { parserOpts: { 'custom-parser': { sourceDescriptions: true } } },
          }),
          'custom-parser',
        );

        assert.strictEqual(sourceDescriptions.length, 1);
        assert.isTrue(isParseResultElement(sourceDescriptions[0]));
      });

      specify('should default to arazzo-json-1 parserName for options lookup', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        // only set parser-specific option, no global sourceDescriptions
        const sourceDescriptions = await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            parse: { parserOpts: { 'arazzo-json-1': { sourceDescriptions: true } } },
          }),
        );

        assert.strictEqual(sourceDescriptions.length, 1);

        const sdParseResult = sourceDescriptions[0]!;
        assert.isTrue(isParseResultElement(sdParseResult));
        assert.isTrue(sdParseResult.classes.includes('source-description'));
        assert.strictEqual(sdParseResult.meta.get('name')!.toValue(), 'petStore');
      });

      specify('should attach parseResult to source description element meta', async function () {
        const uri = path.join(__dirname, 'fixtures', 'source-descriptions', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        await parseSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, { parse: { parserOpts: { sourceDescriptions: true } } }),
        );

        // verify meta is set on source description element
        const api = parseResult.api!;
        const sourceDesc = api.get('sourceDescriptions')!.get(0);
        const attachedParseResult = sourceDesc.meta.get('parseResult');

        assert.isTrue(isParseResultElement(attachedParseResult));
        assert.strictEqual(attachedParseResult.api?.element, 'openApi3_1');
      });
    });
  });
});
