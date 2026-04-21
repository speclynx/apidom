import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { hasElementSourceMap } from '@speclynx/apidom-datamodel';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractorPluginReplaceEmptyElement,
  Overlay1Element,
  refractOverlay1,
} from '../../../../src/index.ts';

describe('given empty value instead of InfoElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      overlay: 1.1.0
      info:
    `;
    const apiDOM = await parse(yamlDefinition);
    const overlay1Element = refractOverlay1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(overlay1Element)).toMatchSnapshot();
  });
});

describe('given empty value instead of Actions', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      overlay: 1.1.0
      actions:
    `;
    const apiDOM = await parse(yamlDefinition);
    const overlay1Element = refractOverlay1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(overlay1Element)).toMatchSnapshot();
  });
});

describe('given Overlay definition with empty values', function () {
  it('should generate proper source maps', async function () {
    const yamlDefinition = dedent`
          overlay: 1.1.0
          info:
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const overlay1Element = refractOverlay1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as Overlay1Element;
    const { info: infoValue } = overlay1Element;

    expect(hasElementSourceMap(infoValue!)).to.be.true;
    expect(infoValue!.startLine).to.equal(1);
    expect(infoValue!.startCharacter).to.equal(5);
    expect(infoValue!.startOffset).to.equal(20);
    expect(infoValue!.endLine).to.equal(1);
    expect(infoValue!.endCharacter).to.equal(5);
    expect(infoValue!.endOffset).to.equal(20);
  });
});
