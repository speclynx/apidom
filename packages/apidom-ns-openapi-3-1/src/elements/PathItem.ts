import { PathItemElement } from '@speclynx/apidom-ns-openapi-3-0';

import OperationElement from './Operation.ts';

/**
 * @public
 */
class PathItem extends PathItemElement {
  get getField(): OperationElement | undefined {
    return this.get('get') as OperationElement | undefined;
  }

  set getField(operation: OperationElement | undefined) {
    this.set('get', operation);
  }

  get put(): OperationElement | undefined {
    return this.get('put') as OperationElement | undefined;
  }

  set put(operation: OperationElement | undefined) {
    this.set('put', operation);
  }

  get post(): OperationElement | undefined {
    return this.get('post') as OperationElement | undefined;
  }

  set post(operation: OperationElement | undefined) {
    this.set('post', operation);
  }

  get deleteField(): OperationElement | undefined {
    return this.get('delete') as OperationElement | undefined;
  }

  set deleteField(operation: OperationElement | undefined) {
    this.set('delete', operation);
  }

  get options(): OperationElement | undefined {
    return this.get('options') as OperationElement | undefined;
  }

  set options(operation: OperationElement | undefined) {
    this.set('options', operation);
  }

  get head(): OperationElement | undefined {
    return this.get('head') as OperationElement | undefined;
  }

  set head(operation: OperationElement | undefined) {
    this.set('head', operation);
  }

  get patch(): OperationElement | undefined {
    return this.get('patch') as OperationElement | undefined;
  }

  set patch(operation: OperationElement | undefined) {
    this.set('patch', operation);
  }

  get trace(): OperationElement | undefined {
    return this.get('trace') as OperationElement | undefined;
  }

  set trace(operation: OperationElement | undefined) {
    this.set('trace', operation);
  }
}

export default PathItem;
