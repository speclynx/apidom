import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { SourceMapElement } from '@speclynx/apidom-datamodel';
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
    const sourceMap = infoValue?.meta.get('sourceMap') as SourceMapElement | undefined;
    const positionStart = sourceMap?.positionStart;
    const positionEnd = sourceMap?.positionEnd;
    const expectedPosition = [1, 5, 19];

    expect(infoValue?.meta.get('sourceMap')).to.be.an.instanceof(SourceMapElement);
    expect(positionStart?.equals(expectedPosition)).to.be.true;
    expect(positionEnd?.equals(expectedPosition)).to.be.true;
  });
});
