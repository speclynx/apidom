import { always } from 'ramda';

import RedisServerBindingElement from '../../../../../../elements/bindings/redis/RedisServerBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type RedisServerBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class RedisServerBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: RedisServerBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'redis', 'ServerBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: RedisServerBindingVisitorOptions) {
    super(options);
    this.element = new RedisServerBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'redis', 'ServerBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default RedisServerBindingVisitor;
