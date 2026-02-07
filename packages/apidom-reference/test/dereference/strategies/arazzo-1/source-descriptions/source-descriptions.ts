import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import { ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';
import { parse } from '@speclynx/apidom-parser-adapter-arazzo-json-1';
import { fileURLToPath } from 'node:url';

import { dereferenceSourceDescriptions } from '../../../../../src/dereference/strategies/arazzo-1/index.ts';
import { options, mergeOptions } from '../../../../../src/configuration/saturated.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('dereference', function () {
  context('dereferenceSourceDescriptions', function () {
    context('given naked parser adapter usage', function () {
      specify('should dereference source descriptions from ParseResult', async function () {
        const uri = path.join(__dirname, 'fixtures', 'root.json');
        const data = fs.readFileSync(uri).toString();

        // use naked parser adapter directly
        const parseResult = await parse(data);

        // use exported dereferenceSourceDescriptions function
        const sourceDescriptions = await dereferenceSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            dereference: { strategyOpts: { sourceDescriptions: true } },
          }),
        );

        assert.strictEqual(sourceDescriptions.length, 1);

        const sdParseResult = sourceDescriptions[0]!;
        assert.isTrue(isParseResultElement(sdParseResult));
        assert.isTrue(sdParseResult.classes.includes('source-description'));
        assert.strictEqual(sdParseResult.meta.get('name')!.toValue(), 'petStore');
        assert.strictEqual(sdParseResult.meta.get('type')!.toValue(), 'openapi');
      });

      specify('should filter source descriptions by name', async function () {
        const uri = path.join(__dirname, 'fixtures', 'root-multi.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

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
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        const sourceDescriptions = await dereferenceSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            dereference: {
              strategyOpts: { sourceDescriptions: true, sourceDescriptionsMaxDepth: 1 },
            },
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

      specify('should return empty array when sourceDescriptions is false', async function () {
        const uri = path.join(__dirname, 'fixtures', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        const sourceDescriptions = await dereferenceSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            dereference: { strategyOpts: { sourceDescriptions: false } },
          }),
        );

        assert.strictEqual(sourceDescriptions.length, 0);
      });

      specify('should allow overriding strategyName parameter', async function () {
        const uri = path.join(__dirname, 'fixtures', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        // use custom strategy name for options lookup
        const sourceDescriptions = await dereferenceSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            dereference: { strategyOpts: { 'custom-strategy': { sourceDescriptions: true } } },
          }),
          'custom-strategy',
        );

        assert.strictEqual(sourceDescriptions.length, 1);
        assert.isTrue(isParseResultElement(sourceDescriptions[0]));
      });

      specify('should default to arazzo-1 strategyName for options lookup', async function () {
        const uri = path.join(__dirname, 'fixtures', 'root.json');
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        // only set strategy-specific option, no global sourceDescriptions
        const sourceDescriptions = await dereferenceSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            dereference: { strategyOpts: { 'arazzo-1': { sourceDescriptions: true } } },
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
        const data = fs.readFileSync(uri).toString();
        const parseResult = await parse(data);

        await dereferenceSourceDescriptions(
          parseResult,
          uri,
          mergeOptions(options, {
            dereference: { strategyOpts: { sourceDescriptions: true } },
          }),
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
