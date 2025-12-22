import { ObjectElement, Attributes, Meta } from '@speclynx/apidom-core';

import ArazzoElement from './Arazzo.ts';
import InfoElement from './Info.ts';
import ComponentsElement from './Components.ts';
import SourceDescriptions from './nces/SourceDescriptions.ts';
import Workflows from './nces/Workflows.ts';

/**
 * @public
 */
class ArazzoSpecification1 extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'arazzoSpecification1';
    this.classes.push('api');
    this.classes.push('arazzo');
  }

  get arazzo(): ArazzoElement | undefined {
    return this.get('arazzo');
  }

  set arazzo(arazzo: ArazzoElement | undefined) {
    this.set('arazzo', arazzo);
  }

  get info(): InfoElement | undefined {
    return this.get('info');
  }

  set info(info: InfoElement | undefined) {
    this.set('info', info);
  }

  get sourceDescriptions(): SourceDescriptions | undefined {
    return this.get('sourceDescriptions');
  }

  set sourceDescriptions(sourceDescriptions: SourceDescriptions | undefined) {
    this.set('sourceDescriptions', sourceDescriptions);
  }

  get workflows(): Workflows | undefined {
    return this.get('workflows');
  }

  set workflows(workflows: Workflows | undefined) {
    this.set('workflows', workflows);
  }

  get components(): ComponentsElement | undefined {
    return this.get('components');
  }

  set components(components: ComponentsElement | undefined) {
    this.set('components', components);
  }
}

export default ArazzoSpecification1;
