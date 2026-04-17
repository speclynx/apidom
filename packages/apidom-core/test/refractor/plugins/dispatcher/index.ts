import sinon from 'sinon';
import { assert } from 'chai';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { Element, NumberElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { toValue, dispatchRefractorPlugins as dispatchPluginsSync } from '../../../../src/index.ts';

const dispatchPluginsAsync = dispatchPluginsSync[Symbol.for('nodejs.util.promisify.custom')];

describe('refrator', function () {
  context('plugins', function () {
    context('dispatcher', function () {
      context('dispatchPluginsSync', function () {
        specify('should dispatch plugins synchronously', function () {
          const preSpy = sinon.spy();
          const postSpy = sinon.spy();
          const NumberElementSpy = sinon.spy((path: Path<NumberElement>) => {
            path.replaceWith(new NumberElement(2));
          });
          const plugin = () => ({
            pre: preSpy,
            visitor: {
              NumberElement: NumberElementSpy,
            },
            post: postSpy,
          });
          const objectElement = new ObjectElement({ a: 1 });
          const result = dispatchPluginsSync(objectElement, [plugin]);

          assert.isTrue(preSpy.calledBefore(NumberElementSpy));
          assert.isTrue(postSpy.calledAfter(NumberElementSpy));
          assert.deepEqual(toValue(result), { a: 2 });
        });

        specify('should throw when async plugin is used', function () {
          const plugin1 = () => ({
            visitor: {
              NumberElement: () => {},
            },
          });
          const plugin2 = () => ({
            visitor: {
              NumberElement: async () => {},
            },
          });

          const objectElement = new ObjectElement({ a: 1 });

          assert.throws(
            () => dispatchPluginsSync(objectElement, [plugin1, plugin2]),
            ApiDOMStructuredError,
            'Async visitor not supported in sync mode',
          );
        });

        specify('should pass traverseOptions to traverse', function () {
          const visited: string[] = [];
          const plugin = () => ({
            visitor: {
              enter(path: Path<Element>) {
                visited.push(path.node.element);
              },
            },
          });

          // create a tree with shared nodes (DAG)
          const shared = new NumberElement(1);
          const objectElement = new ObjectElement({});
          objectElement.set('a', shared);
          objectElement.set('b', shared);

          // without skipVisited, shared node is visited twice
          visited.length = 0;
          dispatchPluginsSync(objectElement, [plugin]);
          const withoutSkip = visited.filter((e) => e === 'number').length;

          // with skipVisited, shared node is visited once
          visited.length = 0;
          dispatchPluginsSync(objectElement, [plugin], {
            traverseOptions: { skipVisited: true },
          });
          const withSkip = visited.filter((e) => e === 'number').length;

          assert.strictEqual(withoutSkip, 2);
          assert.strictEqual(withSkip, 1);
        });
      });

      context('dispatchPluginsASync', function () {
        specify('should dispatch plugins asynchronously', async function () {
          const preSpy = sinon.spy();
          const postSpy = sinon.spy();
          const NumberElementSpy = sinon.spy(async (path: Path<NumberElement>) => {
            path.replaceWith(new NumberElement(2));
          });
          const plugin = () => ({
            pre: preSpy,
            visitor: {
              NumberElement: NumberElementSpy,
            },
            post: postSpy,
          });
          const objectElement = new ObjectElement({ a: 1 });
          const result = await dispatchPluginsAsync(objectElement, [plugin]);

          assert.isTrue(preSpy.calledBefore(NumberElementSpy));
          assert.isTrue(postSpy.calledAfter(NumberElementSpy));
          assert.deepEqual(toValue(result), { a: 2 });
        });
      });
    });
  });
});
