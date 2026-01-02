import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class PathItemServers extends ArrayElement {
  static primaryClass = 'path-item-servers';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(PathItemServers.primaryClass);
    this.classes.push('servers');
  }
}

export default PathItemServers;
