import { Element, ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { traverse, type Path } from '@speclynx/apidom-traverse';

import serializeValue from './value.ts';

interface YamlVisitorOptions {
  readonly directive?: boolean;
  readonly indent?: number;
}

class YamlVisitor {
  protected static readonly indentChar = '  ';

  public result: string;

  protected readonly indent: number;

  constructor({ directive = false, indent = 0 }: YamlVisitorOptions = {}) {
    this.result = directive ? '%YAML 1.2\n---\n' : '';
    this.indent = indent;
  }

  public NumberElement(path: Path<Element>): void {
    this.result += serializeValue(path.node);
  }

  public BooleanElement(path: Path<Element>): void {
    const value = serializeValue(path.node);
    this.result += value ? 'true' : 'false';
  }

  public StringElement(path: Path<Element>): void {
    // for simplicity and avoiding ambiguity we always wrap strings in quotes
    this.result += JSON.stringify(serializeValue(path.node));
  }

  public NullElement(): void {
    this.result += 'null';
  }

  public ArrayElement(path: Path<Element>): void {
    const element = path.node as ArrayElement;

    if (element.length === 0) {
      this.result += '[]';
      path.skip();
      return;
    }

    element.forEach((item) => {
      const visitor = new YamlVisitor({ indent: this.indent + 1 });
      const indent = YamlVisitor.indentChar.repeat(this.indent);

      traverse(item, visitor);

      const { result } = visitor;

      this.result += result.startsWith('\n') ? `\n${indent}-${result}` : `\n${indent}- ${result}`;
    });

    path.skip();
  }

  public ObjectElement(path: Path<Element>): void {
    const element = path.node as ObjectElement;

    if (element.length === 0) {
      this.result += '{}';
      path.skip();
      return;
    }

    element.forEach((value, key) => {
      const keyVisitor = new YamlVisitor({ indent: this.indent + 1 });
      const valueVisitor = new YamlVisitor({ indent: this.indent + 1 });
      const indent = YamlVisitor.indentChar.repeat(this.indent);

      traverse(key, keyVisitor);
      traverse(value, valueVisitor);

      const { result: keyResult } = keyVisitor;
      const { result: valueResult } = valueVisitor;

      this.result += valueResult.startsWith('\n')
        ? `\n${indent}${keyResult}:${valueResult}`
        : `\n${indent}${keyResult}: ${valueResult}`;
    });

    path.skip();
  }
}

/**
 * @public
 */
const serializer = (element: Element, { directive = false } = {}): string => {
  const visitor = new YamlVisitor({ directive });

  traverse(element, visitor);

  return visitor.result;
};

export default serializer;
