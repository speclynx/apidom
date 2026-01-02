import { always } from 'ramda';

import RedisOperationBindingElement from '../../../../../../elements/bindings/redis/RedisOperationBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type RedisOperationBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class RedisOperationBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: RedisOperationBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'redis', 'OperationBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: RedisOperationBindingVisitorOptions) {
    super(options);
    this.element = new RedisOperationBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'redis', 'OperationBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default RedisOperationBindingVisitor;
