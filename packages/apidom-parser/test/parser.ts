import { assert } from 'chai';
import {
  Namespace,
  ParseResultElement,
  ObjectElement,
  isParseResultElement,
} from '@speclynx/apidom-datamodel';
import { MediaTypes } from '@speclynx/apidom-core';

import ApiDOMParser, { ParserError } from '../src/parser.ts';

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

const mockMediaTypes = new MockMediaTypes('application/vnd.mock+json');

// Create a mock adapter that successfully parses
const mockSuccessAdapter = {
  mediaTypes: mockMediaTypes,
  namespace: mockNamespace,
  detect: async (source: string) => source.includes('"mock"'),
  parse: async () => {
    const parseResult = new ParseResultElement();
    const result = new ObjectElement({ mock: true });
    result.classes.push('result');
    parseResult.push(result);
    return parseResult;
  },
};

// Create a mock adapter that throws during detection
const mockFailingAdapter = {
  mediaTypes: new MockMediaTypes('application/vnd.failing+yaml'),
  namespace: mockNamespace,
  detect: async (source: string): Promise<boolean> => {
    if (source.includes('failing:')) {
      throw new Error('Detection failed');
    }
    return false;
  },
  parse: async () => {
    return new ParseResultElement();
  },
};

describe('apidom-parser', function () {
  it('should parse', async function () {
    const parser = new ApiDOMParser().use(mockSuccessAdapter);
    const parseResult = await parser.parse('{"mock": true}');

    assert.isTrue(isParseResultElement(parseResult));
  });

  it('should throw error when no adapter matches', async function () {
    const source = 'unknown content';
    const parser = new ApiDOMParser().use(mockSuccessAdapter);

    try {
      await parser.parse(source);
      assert.fail('should throw ParserError');
    } catch (error: unknown) {
      if (error instanceof ParserError) {
        assert.instanceOf(error, ParserError);
        assert.strictEqual(error.source, source);
        assert.deepEqual(error.parserOptions, {});
      } else {
        assert.fail('should throw ParserError');
      }
    }
  });

  it('should throw error when adapter detection fails', async function () {
    const source = 'failing: true';
    const parser = new ApiDOMParser().use(mockFailingAdapter);

    try {
      await parser.parse(source);
      assert.fail('should throw ParserError');
    } catch (error: unknown) {
      if (error instanceof ParserError) {
        assert.instanceOf(error, ParserError);
        assert.strictEqual(error.source, source);
        assert.deepEqual(error.parserOptions, {});
      } else {
        assert.fail('should throw ParserError');
      }
    }
  });

  it('should find namespace', async function () {
    const parser = new ApiDOMParser().use(mockSuccessAdapter);
    const namespace = await parser.findNamespace('{"mock": true}');

    assert.strictEqual(namespace, mockNamespace);
  });

  it('should find media type', async function () {
    const parser = new ApiDOMParser().use(mockSuccessAdapter);
    const mediaType = await parser.findMediaType('{"mock": true}');

    assert.strictEqual(mediaType, 'application/vnd.mock+json');
  });
});
