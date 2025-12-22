import {
  PatternPropertiesVisitor as PatternPropertiesJSONSchema202012Visitor,
  PatternPropertiesVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';

export type { PatternPropertiesVisitorOptions };

/**
 * @public
 */
class PatternPropertiesVisitor extends PatternPropertiesJSONSchema202012Visitor {
  constructor(options: PatternPropertiesVisitorOptions) {
    super(options);
    this.passingOptionsNames.push('parent');
  }
}

export default PatternPropertiesVisitor;
