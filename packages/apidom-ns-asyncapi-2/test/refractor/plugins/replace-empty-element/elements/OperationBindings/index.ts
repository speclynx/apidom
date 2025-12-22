import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import dedent from 'dedent';

import {
  OperationBindingsElement,
  refractorPluginReplaceEmptyElement,
} from '../../../../../../src/index.ts';

it('should refract to semantic ApiDOM tree', async function () {
  const yamlDefinition = dedent`
          http:
          ws:
          kafka:
          anypointmq:
          amqp:
          amqp1:
          mqtt:
          mqtt5:
          nats:
          jms:
          sns:
          solace:
          sqs:
          stomp:
          redis:
          mercure:
       `;
  const apiDOM = await parse(yamlDefinition);
  const operationBindingsElement = OperationBindingsElement.refract(apiDOM.result, {
    plugins: [refractorPluginReplaceEmptyElement()],
  });

  expect(sexprs(operationBindingsElement)).toMatchSnapshot();
});
