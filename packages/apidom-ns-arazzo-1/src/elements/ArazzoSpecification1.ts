import { ObjectElement, type Attributes, type Meta } from '@speclynx/apidom-datamodel';

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
    return this.get('arazzo') as ArazzoElement | undefined;
  }

  set arazzo(arazzo: ArazzoElement | undefined) {
    this.set('arazzo', arazzo);
  }

  get info(): InfoElement | undefined {
    return this.get('info') as InfoElement | undefined;
  }

  set info(info: InfoElement | undefined) {
    this.set('info', info);
  }

  get sourceDescriptions(): SourceDescriptions | undefined {
    return this.get('sourceDescriptions') as SourceDescriptions | undefined;
  }

  set sourceDescriptions(sourceDescriptions: SourceDescriptions | undefined) {
    this.set('sourceDescriptions', sourceDescriptions);
  }

  get workflows(): Workflows | undefined {
    return this.get('workflows') as Workflows | undefined;
  }

  set workflows(workflows: Workflows | undefined) {
    this.set('workflows', workflows);
  }

  get components(): ComponentsElement | undefined {
    return this.get('components') as ComponentsElement | undefined;
  }

  set components(components: ComponentsElement | undefined) {
    this.set('components', components);
  }
}

export default ArazzoSpecification1;
