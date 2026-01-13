import Node from '../Node.ts';
import type { NodeOptions } from '../Node.ts';
import YamlScalar from './YamlScalar.ts';
import type { YamlStyleGroup } from './YamlStyle.ts';
import { isScalar, isMapping, isSequence, isAlias } from './predicates.ts';

/**
 * @public
 */
export interface YamlKeyValuePairOptions extends NodeOptions {
  readonly styleGroup: YamlStyleGroup;
}

/**
 * @public
 */
class YamlKeyValuePair extends Node {
  public static readonly type = 'keyValuePair';

  public readonly styleGroup: YamlStyleGroup;

  constructor({ styleGroup, ...rest }: YamlKeyValuePairOptions) {
    super({ ...rest });
    this.styleGroup = styleGroup;
  }
}

Object.defineProperties(YamlKeyValuePair.prototype, {
  key: {
    get(): YamlScalar {
      return this.children.filter(
        (node: unknown) => isScalar(node) || isMapping(node) || isSequence(node),
      )[0];
    },
    enumerable: true,
  },
  value: {
    get(): unknown {
      const { key, children } = this;
      const excludeKeyPredicate = (node: unknown) => node !== key;
      const valuePredicate = (node: unknown) =>
        isScalar(node) || isMapping(node) || isSequence(node) || isAlias(node);

      return children.filter(
        (node: unknown) => excludeKeyPredicate(node) && valuePredicate(node),
      )[0];
    },
    enumerable: true,
  },
});

export default YamlKeyValuePair;
