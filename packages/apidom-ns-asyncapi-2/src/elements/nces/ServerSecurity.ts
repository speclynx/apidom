import { ArrayElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
class ServerSecurity extends ArrayElement {
  static primaryClass = 'server-security';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(ServerSecurity.primaryClass);
  }
}

export default ServerSecurity;
