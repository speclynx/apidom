import { Element, isElement } from '@speclynx/apidom-datamodel';
import ShortUniqueId from 'short-unique-id';

import ElementIdentityError from './errors/ElementIdentityError.ts';

/**
 * @public
 */
export class IdentityManager {
  protected readonly uuid: ShortUniqueId;

  protected readonly identityMap: WeakMap<Element, string>;

  constructor({ length = 6 } = {}) {
    this.uuid = new ShortUniqueId({ length });
    this.identityMap = new WeakMap();
  }

  identify<T extends Element>(this: IdentityManager, element: T): string {
    if (!isElement(element)) {
      throw new ElementIdentityError(
        'Cannot not identify the element. `element` is neither structurally compatible nor a subclass of an Element class.',
        {
          value: element,
        },
      );
    }

    // use already assigned identity
    if (element.hasMetaProperty('id')) {
      const existingId = element.id;
      if (typeof existingId === 'string' && existingId !== '') {
        return existingId;
      }
    }

    // assign identity in immutable way
    if (this.identityMap.has(element)) {
      return this.identityMap.get(element)!;
    }

    // return element identity
    const id = this.generateId();
    this.identityMap.set(element, id);
    return id;
  }

  forget<T extends Element>(element: T): boolean {
    if (this.identityMap.has(element)) {
      this.identityMap.delete(element);
      return true;
    }
    return false;
  }

  generateId(): string {
    return this.uuid.randomUUID();
  }
}

/**
 * @public
 */
export const defaultIdentityManager = new IdentityManager();
