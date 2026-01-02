import { always } from 'ramda';

import RedisChannelBindingElement from '../../../../../../elements/bindings/redis/RedisChannelBinding.ts';
import { SpecPath } from '../../../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../../../bases.ts';

/**
 * @public
 */
export type RedisChannelBindingVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class RedisChannelBindingVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: RedisChannelBindingElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'bindings', 'redis', 'ChannelBinding']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: RedisChannelBindingVisitorOptions) {
    super(options);
    this.element = new RedisChannelBindingElement();
    this.specPath = always(['document', 'objects', 'bindings', 'redis', 'ChannelBinding']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default RedisChannelBindingVisitor;
