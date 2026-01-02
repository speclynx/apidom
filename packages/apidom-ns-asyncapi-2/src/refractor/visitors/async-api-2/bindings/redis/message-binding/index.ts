import { always } from 'ramda';

import RedisMessageBindingElement from '../../../../../../elements/bindings/redis/RedisMessageBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type RedisMessageBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class RedisMessageBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: RedisMessageBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'redis', 'MessageBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: RedisMessageBindingVisitorOptions) {
    super(options);
    this.element = new RedisMessageBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'redis', 'MessageBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default RedisMessageBindingVisitor;
