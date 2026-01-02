import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { Namespace, ParseResultElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { MediaTypes } from '@speclynx/apidom-core';

import ApiDOMParser from '../src/parser.ts';

// Create mock namespace
const mockNamespace = new Namespace();

// Create mock media types
class MockMediaTypes extends MediaTypes<string> {
  filterByFormat() {
    return new MockMediaTypes(this[0]);
  }

  findBy() {
    return this[0];
  }

  latest() {
    return this.at(-1);
  }
}

// Create mock JSON adapter
const createMockJsonAdapter = () => ({
  mediaTypes: new MockMediaTypes('application/vnd.mock+json'),
  namespace: mockNamespace,
  detect: async (source: string) => {
    try {
      JSON.parse(source);
      return source.includes('"mockapi"');
    } catch {
      return false;
    }
  },
  parse: async (source: string) => {
    const parseResult = new ParseResultElement();
    const result = new ObjectElement(JSON.parse(source));
    result.classes.push('result');
    parseResult.push(result);
    return parseResult;
  },
});

// Create mock YAML adapter
const createMockYamlAdapter = () => ({
  mediaTypes: new MockMediaTypes('application/vnd.mock+yaml'),
  namespace: mockNamespace,
  detect: async (source: string) => {
    // Simple YAML detection - not JSON and contains mockapi
    try {
      JSON.parse(source);
      return false; // It's valid JSON, not YAML
    } catch {
      return source.includes('mockapi:');
    }
  },
  parse: async () => {
    const parseResult = new ParseResultElement();
    // Simple mock YAML parsing
    const result = new ObjectElement({ mockapi: '2.6.0' });
    result.classes.push('result');
    parseResult.push(result);
    return parseResult;
  },
});

const parser = new ApiDOMParser();
const mockJsonAdapter = createMockJsonAdapter();
const mockYamlAdapter = createMockYamlAdapter();

parser.use(mockJsonAdapter);
parser.use(mockYamlAdapter);

describe('given mock API definition', function () {
  const sandbox = createSandbox();

  beforeEach(function () {
    sandbox.spy(mockJsonAdapter, 'parse');
    sandbox.spy(mockYamlAdapter, 'parse');
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('given JSON format', function () {
    specify('should parse successfully', async function () {
      const parseResult = await parser.parse('{"mockapi":"2.6.0"}');

      assert.isDefined(parseResult.result);
    });

    specify('should use mockJsonAdapter', async function () {
      await parser.parse('{"mockapi":"2.6.0"}');

      // @ts-ignore
      assert.isTrue(mockJsonAdapter.parse.calledOnce);
      // @ts-ignore
      assert.isTrue(mockYamlAdapter.parse.notCalled);
    });
  });

  context('given YAML format', function () {
    specify('should parse successfully', async function () {
      const parseResult = await parser.parse('mockapi: "2.6.0"');

      assert.isDefined(parseResult.result);
    });

    specify('should use mockYamlAdapter', async function () {
      await parser.parse('mockapi: "2.6.0"');

      // @ts-ignore
      assert.isTrue(mockYamlAdapter.parse.calledOnce);
      // @ts-ignore
      assert.isTrue(mockJsonAdapter.parse.notCalled);
    });
  });
});
