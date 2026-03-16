import {
  ArrayElement,
  ObjectElement,
  isObjectElement,
  isArrayElement,
} from '@speclynx/apidom-datamodel';
import type { JSONPointer } from '@speclynx/apidom-json-pointer';

class NormalizeStorage {
  private internalStore: ArrayElement | undefined;

  constructor(
    protected storageElement: ObjectElement,
    protected storageField: string,
    protected storageSubField: string,
  ) {}

  protected get store() {
    if (this.internalStore === undefined) {
      let rootStore: ObjectElement = this.storageElement.get(this.storageField) as ObjectElement;

      if (!isObjectElement(rootStore)) {
        rootStore = new ObjectElement();
        this.storageElement.set(this.storageField, rootStore);
      }

      let store: ArrayElement = rootStore.get(this.storageSubField) as ArrayElement;
      if (!isArrayElement(store)) {
        store = new ArrayElement();
        rootStore.set(this.storageSubField, store);
      }

      this.internalStore = store;
    }

    return this.internalStore;
  }

  public append(pointer: JSONPointer) {
    if (!this.includes(pointer)) {
      this.store.push(pointer);
    }
  }

  public includes(pointer: JSONPointer) {
    return this.store.includes(pointer);
  }
}

export default NormalizeStorage;
