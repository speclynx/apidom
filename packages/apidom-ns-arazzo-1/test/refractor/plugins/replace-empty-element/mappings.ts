import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { hasElementSourceMap } from '@speclynx/apidom-datamodel';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractorPluginReplaceEmptyElement,
  ArazzoSpecification1Element,
  refractArazzoSpecification1,
} from '../../../../src/index.ts';

describe('given empty value instead of InfoElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.0.1
      info:
    `;
    const apiDOM = await parse(yamlDefinition);
    const workflowsSpecificationElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(workflowsSpecificationElement)).toMatchSnapshot();
  });
});

describe('given Workflows definition with empty values', function () {
  it('should generate proper source maps', async function () {
    const yamlDefinition = dedent`
          arazzo: 1.0.1
          info:
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const workflowsSpecificationElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const { info: infoValue } = workflowsSpecificationElement;

    expect(hasElementSourceMap(infoValue!)).to.be.true;
    expect(infoValue!.startLine).to.equal(1);
    expect(infoValue!.startCharacter).to.equal(5);
    expect(infoValue!.startOffset).to.equal(19);
    expect(infoValue!.endLine).to.equal(1);
    expect(infoValue!.endCharacter).to.equal(5);
    expect(infoValue!.endOffset).to.equal(19);
  });
});
