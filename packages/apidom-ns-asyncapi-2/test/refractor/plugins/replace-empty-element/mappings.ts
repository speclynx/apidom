import { expect } from 'chai';
import dedent from 'dedent';
import { includesClasses, hasElementSourceMap } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractorPluginReplaceEmptyElement,
  AsyncApi2Element,
  ComponentsElement,
  refractAsyncApi2,
} from '../../../../src/index.ts';

describe('given empty value instead of InfoElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          info:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead of ContactElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          info:
            contact:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead of Message.payload with unspecified schema format', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          components:
            messages:
                userSignUp:
                  payload:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead of Message.payload with supported schema format', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          components:
            messages:
                userSignUp:
                  schemaFormat: application/vnd.aai.asyncapi;version=2.6.0
                  payload:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead of Message.payload with unsupported schema format', function () {
  it('should replace empty value with generic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          components:
            messages:
                userSignUp:
                  schemaFormat: application/vnd.apache.avro;version=1.9.0
                  payload:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead for AsyncAPI.components.schemas', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          components:
            schemas:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as AsyncApi2Element;
    const componentsElement = asyncApiElement.get('components') as ComponentsElement;
    const isComponentsSchemas = includesClasses(componentsElement.get('schemas')!, [
      'components-schemas',
    ]);

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
    expect(isComponentsSchemas).to.be.true;
  });
});

describe('given empty value instead for AsyncAPI.components.schemas.*', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          components:
            schemas:
              Schema1:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as AsyncApi2Element;

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead for Schema.properties.*', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          components:
            schemas:
              User:
                properties:
                  firstName:
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as AsyncApi2Element;

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given AsyncAPI definition with no empty values', function () {
  it('should do nothing', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          id: urn:com:smartylighting:streetlights:server
        `;
    const apiDOM = await parse(yamlDefinition);
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as AsyncApi2Element;

    expect(sexprs(asyncApiElement)).toMatchSnapshot();
  });
});

describe('given AsyncAPI definition with empty values', function () {
  it('should generate proper source maps', async function () {
    const yamlDefinition = dedent`
          asyncapi: 2.6.0
          info:
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const asyncApiElement = refractAsyncApi2(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as AsyncApi2Element;
    const { info: infoValue } = asyncApiElement;

    expect(hasElementSourceMap(infoValue!)).to.be.true;
    expect(infoValue!.startLine).to.equal(1);
    expect(infoValue!.startCharacter).to.equal(5);
    expect(infoValue!.startOffset).to.equal(21);
    expect(infoValue!.endLine).to.equal(1);
    expect(infoValue!.endCharacter).to.equal(5);
    expect(infoValue!.endOffset).to.equal(21);
  });
});
