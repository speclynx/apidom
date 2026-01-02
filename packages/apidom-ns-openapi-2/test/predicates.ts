import { assert } from 'chai';

import {
  SwaggerElement,
  SwaggerVersionElement,
  InfoElement,
  ContactElement,
  LicenseElement,
  PathsElement,
  PathItemElement,
  OperationElement,
  ExternalDocumentationElement,
  ParameterElement,
  ItemsElement,
  ResponsesElement,
  ResponseElement,
  HeadersElement,
  ExampleElement,
  HeaderElement,
  TagElement,
  ReferenceElement,
  SchemaElement,
  XmlElement,
  DefinitionsElement,
  ParametersDefinitionsElement,
  ResponsesDefinitionsElement,
  SecurityDefinitionsElement,
  SecuritySchemeElement,
  ScopesElement,
  SecurityRequirementElement,
  isSwaggerElement,
  isSwaggerVersionElement,
  isInfoElement,
  isContactElement,
  isLicenseElement,
  isPathsElement,
  isPathItemElement,
  isOperationElement,
  isExternalDocumentationElement,
  isParameterElement,
  isItemsElement,
  isResponsesElement,
  isResponseElement,
  isHeadersElement,
  isExampleElement,
  isHeaderElement,
  isTagElement,
  isReferenceElement,
  isSchemaElement,
  isXmlElement,
  isDefinitionsElement,
  isParametersDefinitionsElement,
  isResponsesDefinitionsElement,
  isSecurityDefinitionsElement,
  isSecuritySchemeElement,
  isScopesElement,
  isSecurityRequirementElement,
} from '../src/index.ts';

describe('predicates', function () {
  context('isSwaggerElement', function () {
    context('given SwaggerElement instance value', function () {
      specify('should return true', function () {
        const element = new SwaggerElement();

        assert.isTrue(isSwaggerElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SwaggerSubElement extends SwaggerElement {}

        assert.isTrue(isSwaggerElement(new SwaggerSubElement()));
      });
    });

    context('given non SwaggerSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSwaggerElement(1));
        assert.isFalse(isSwaggerElement(null));
        assert.isFalse(isSwaggerElement(undefined));
        assert.isFalse(isSwaggerElement({}));
        assert.isFalse(isSwaggerElement([]));
        assert.isFalse(isSwaggerElement('string'));
      });
    });
  });

  context('isSwaggerVersionElement', function () {
    context('given SwaggerVersionElement instance value', function () {
      specify('should return true', function () {
        const element = new SwaggerVersionElement();

        assert.isTrue(isSwaggerVersionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SwaggerVersionSubElement extends SwaggerVersionElement {}

        assert.isTrue(isSwaggerVersionElement(new SwaggerVersionSubElement()));
      });
    });

    context('given non SwaggerVersionSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSwaggerVersionElement(1));
        assert.isFalse(isSwaggerVersionElement(null));
        assert.isFalse(isSwaggerVersionElement(undefined));
        assert.isFalse(isSwaggerVersionElement({}));
        assert.isFalse(isSwaggerVersionElement([]));
        assert.isFalse(isSwaggerVersionElement('string'));
      });
    });
  });

  context('isInfoElement', function () {
    context('given InfoElement instance value', function () {
      specify('should return true', function () {
        const element = new InfoElement();

        assert.isTrue(isInfoElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class InfoSubElement extends InfoElement {}

        assert.isTrue(isInfoElement(new InfoSubElement()));
      });
    });

    context('given non InfoSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isInfoElement(1));
        assert.isFalse(isInfoElement(null));
        assert.isFalse(isInfoElement(undefined));
        assert.isFalse(isInfoElement({}));
        assert.isFalse(isInfoElement([]));
        assert.isFalse(isInfoElement('string'));
      });
    });
  });

  context('isLicenseElement', function () {
    context('given LicenseElement instance value', function () {
      specify('should return true', function () {
        const element = new LicenseElement();

        assert.isTrue(isLicenseElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class LicenseSubElement extends LicenseElement {}

        assert.isTrue(isLicenseElement(new LicenseSubElement()));
      });
    });

    context('given non LicenseSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isLicenseElement(1));
        assert.isFalse(isLicenseElement(null));
        assert.isFalse(isLicenseElement(undefined));
        assert.isFalse(isLicenseElement({}));
        assert.isFalse(isLicenseElement([]));
        assert.isFalse(isLicenseElement('string'));
      });
    });
  });

  context('isContactElement', function () {
    context('given ContactElement instance value', function () {
      specify('should return true', function () {
        const element = new ContactElement();

        assert.isTrue(isContactElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ContactSubElement extends ContactElement {}

        assert.isTrue(isContactElement(new ContactSubElement()));
      });
    });

    context('given non ContactSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isContactElement(1));
        assert.isFalse(isContactElement(null));
        assert.isFalse(isContactElement(undefined));
        assert.isFalse(isContactElement({}));
        assert.isFalse(isContactElement([]));
        assert.isFalse(isContactElement('string'));
      });
    });
  });

  context('isPathsElement', function () {
    context("given PathsElement instance value with element 'paths'", function () {
      specify('should return true', function () {
        const element = new PathsElement();

        assert.isTrue(isPathsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class PathsSubElement extends PathsElement {}

        assert.isTrue(isPathsElement(new PathsSubElement()));
      });
    });

    context('given non PathsSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isPathsElement(1));
        assert.isFalse(isPathsElement(null));
        assert.isFalse(isPathsElement(undefined));
        assert.isFalse(isPathsElement({}));
        assert.isFalse(isPathsElement([]));
        assert.isFalse(isPathsElement('string'));
      });
    });
  });

  context('isPathItemElement', function () {
    context('given PathItemElement instance value', function () {
      specify('should return true', function () {
        const element = new PathItemElement();

        assert.isTrue(isPathItemElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class PathItemSubElement extends PathItemElement {}

        assert.isTrue(isPathItemElement(new PathItemSubElement()));
      });
    });

    context('given non PathItemSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isPathItemElement(1));
        assert.isFalse(isPathItemElement(null));
        assert.isFalse(isPathItemElement(undefined));
        assert.isFalse(isPathItemElement({}));
        assert.isFalse(isPathItemElement([]));
        assert.isFalse(isPathItemElement('string'));
      });
    });
  });

  context('isOperationElement', function () {
    context("given OperationElement instance value with element 'get'", function () {
      specify('should return true', function () {
        const element = new OperationElement();

        assert.isTrue(isOperationElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class OperationSubElement extends OperationElement {}

        assert.isTrue(isOperationElement(new OperationSubElement()));
      });
    });

    context('given non OperationSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isOperationElement(1));
        assert.isFalse(isOperationElement(null));
        assert.isFalse(isOperationElement(undefined));
        assert.isFalse(isOperationElement({}));
        assert.isFalse(isOperationElement([]));
        assert.isFalse(isOperationElement('string'));
      });
    });
  });

  context('isExternalDocumentationElement', function () {
    context('given ExternalDocumentationElement instance value', function () {
      specify('should return true', function () {
        const element = new ExternalDocumentationElement();

        assert.isTrue(isExternalDocumentationElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ExternalDocumentationSubElement extends ExternalDocumentationElement {}

        assert.isTrue(isExternalDocumentationElement(new ExternalDocumentationSubElement()));
      });
    });

    context('given non ExternalDocumentationSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isExternalDocumentationElement(1));
        assert.isFalse(isExternalDocumentationElement(null));
        assert.isFalse(isExternalDocumentationElement(undefined));
        assert.isFalse(isExternalDocumentationElement({}));
        assert.isFalse(isExternalDocumentationElement([]));
        assert.isFalse(isExternalDocumentationElement('string'));
      });
    });
  });

  context('isParameterElement', function () {
    context('given ParameterElement instance value', function () {
      specify('should return true', function () {
        const element = new ParameterElement();

        assert.isTrue(isParameterElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ParameterSubElement extends ParameterElement {}

        assert.isTrue(isParameterElement(new ParameterSubElement()));
      });
    });

    context('given non ParameterSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isParameterElement(1));
        assert.isFalse(isParameterElement(null));
        assert.isFalse(isParameterElement(undefined));
        assert.isFalse(isParameterElement({}));
        assert.isFalse(isParameterElement([]));
        assert.isFalse(isParameterElement('string'));
      });
    });
  });

  context('isItemsElement', function () {
    context('given ItemsElement instance value', function () {
      specify('should return true', function () {
        const element = new ItemsElement();

        assert.isTrue(isItemsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ItemsSubElement extends ItemsElement {}

        assert.isTrue(isItemsElement(new ItemsSubElement()));
      });
    });

    context('given non ItemsSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isItemsElement(1));
        assert.isFalse(isItemsElement(null));
        assert.isFalse(isItemsElement(undefined));
        assert.isFalse(isItemsElement({}));
        assert.isFalse(isItemsElement([]));
        assert.isFalse(isItemsElement('string'));
      });
    });
  });

  context('isResponsesElement', function () {
    context('given ResponsesElement instance value', function () {
      specify('should return true', function () {
        const element = new ResponsesElement();

        assert.isTrue(isResponsesElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ResponsesSubElement extends ResponsesElement {}

        assert.isTrue(isResponsesElement(new ResponsesSubElement()));
      });
    });

    context('given non ResponsesSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isResponsesElement(1));
        assert.isFalse(isResponsesElement(null));
        assert.isFalse(isResponsesElement(undefined));
        assert.isFalse(isResponsesElement({}));
        assert.isFalse(isResponsesElement([]));
        assert.isFalse(isResponsesElement('string'));
      });
    });
  });

  context('isResponseElement', function () {
    context('given ResponseElement instance value', function () {
      specify('should return true', function () {
        const element = new ResponseElement();

        assert.isTrue(isResponseElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ResponseSubElement extends ResponseElement {}

        assert.isTrue(isResponseElement(new ResponseSubElement()));
      });
    });

    context('given non ResponseSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isResponseElement(1));
        assert.isFalse(isResponseElement(null));
        assert.isFalse(isResponseElement(undefined));
        assert.isFalse(isResponseElement({}));
        assert.isFalse(isResponseElement([]));
        assert.isFalse(isResponseElement('string'));
      });
    });
  });

  context('isHeadersElement', function () {
    context('given HeadersElement instance value', function () {
      specify('should return true', function () {
        const element = new HeadersElement();

        assert.isTrue(isHeadersElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class HeadersSubElement extends HeadersElement {}

        assert.isTrue(isHeadersElement(new HeadersSubElement()));
      });
    });

    context('given non HeadersSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isHeadersElement(1));
        assert.isFalse(isHeadersElement(null));
        assert.isFalse(isHeadersElement(undefined));
        assert.isFalse(isHeadersElement({}));
        assert.isFalse(isHeadersElement([]));
        assert.isFalse(isHeadersElement('string'));
      });
    });
  });

  context('isExampleElement', function () {
    context('given ExampleElement instance value', function () {
      specify('should return true', function () {
        const element = new ExampleElement();

        assert.isTrue(isExampleElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ExampleSubElement extends ExampleElement {}

        assert.isTrue(isExampleElement(new ExampleSubElement()));
      });
    });

    context('given non ExampleSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isExampleElement(1));
        assert.isFalse(isExampleElement(null));
        assert.isFalse(isExampleElement(undefined));
        assert.isFalse(isExampleElement({}));
        assert.isFalse(isExampleElement([]));
        assert.isFalse(isExampleElement('string'));
      });
    });
  });

  context('isHeaderElement', function () {
    context('given HeaderElement instance value', function () {
      specify('should return true', function () {
        const element = new HeaderElement();

        assert.isTrue(isHeaderElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class HeaderSubElement extends HeaderElement {}

        assert.isTrue(isHeaderElement(new HeaderSubElement()));
      });
    });

    context('given non HeaderSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isHeaderElement(1));
        assert.isFalse(isHeaderElement(null));
        assert.isFalse(isHeaderElement(undefined));
        assert.isFalse(isHeaderElement({}));
        assert.isFalse(isHeaderElement([]));
        assert.isFalse(isHeaderElement('string'));
      });
    });
  });

  context('isTagElement', function () {
    context('given TagElement instance value', function () {
      specify('should return true', function () {
        const element = new TagElement();

        assert.isTrue(isTagElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class TagSubElement extends TagElement {}

        assert.isTrue(isTagElement(new TagSubElement()));
      });
    });

    context('given non TagSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isTagElement(1));
        assert.isFalse(isTagElement(null));
        assert.isFalse(isTagElement(undefined));
        assert.isFalse(isTagElement({}));
        assert.isFalse(isTagElement([]));
        assert.isFalse(isTagElement('string'));
      });
    });
  });

  context('isReferenceElement', function () {
    context('given ReferenceElement instance value', function () {
      specify('should return true', function () {
        const element = new ReferenceElement();

        assert.isTrue(isReferenceElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ReferenceSubElement extends ReferenceElement {}

        assert.isTrue(isReferenceElement(new ReferenceSubElement()));
      });
    });

    context('given non ReferenceSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isReferenceElement(1));
        assert.isFalse(isReferenceElement(null));
        assert.isFalse(isReferenceElement(undefined));
        assert.isFalse(isReferenceElement({}));
        assert.isFalse(isReferenceElement([]));
        assert.isFalse(isReferenceElement('string'));
      });
    });
  });

  context('isSchemaElement', function () {
    context('given SchemaElement instance value', function () {
      specify('should return true', function () {
        const element = new SchemaElement();

        assert.isTrue(isSchemaElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SchemaSubElement extends SchemaElement {}

        assert.isTrue(isSchemaElement(new SchemaSubElement()));
      });
    });

    context('given non SchemaSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSchemaElement(1));
        assert.isFalse(isSchemaElement(null));
        assert.isFalse(isSchemaElement(undefined));
        assert.isFalse(isSchemaElement({}));
        assert.isFalse(isSchemaElement([]));
        assert.isFalse(isSchemaElement('string'));
      });
    });
  });

  context('isXmlElement', function () {
    context('given XmlElement instance value', function () {
      specify('should return true', function () {
        const element = new XmlElement();

        assert.isTrue(isXmlElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class XmlSubElement extends XmlElement {}

        assert.isTrue(isXmlElement(new XmlSubElement()));
      });
    });

    context('given non XmlSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isXmlElement(1));
        assert.isFalse(isXmlElement(null));
        assert.isFalse(isXmlElement(undefined));
        assert.isFalse(isXmlElement({}));
        assert.isFalse(isXmlElement([]));
        assert.isFalse(isXmlElement('string'));
      });
    });
  });

  context('isDefinitionsElement', function () {
    context('given DefinitionsElement instance value', function () {
      specify('should return true', function () {
        const element = new DefinitionsElement();

        assert.isTrue(isDefinitionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class DefinitionsSubElement extends DefinitionsElement {}

        assert.isTrue(isDefinitionsElement(new DefinitionsSubElement()));
      });
    });

    context('given non DefinitionsSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isDefinitionsElement(1));
        assert.isFalse(isDefinitionsElement(null));
        assert.isFalse(isDefinitionsElement(undefined));
        assert.isFalse(isDefinitionsElement({}));
        assert.isFalse(isDefinitionsElement([]));
        assert.isFalse(isDefinitionsElement('string'));
      });
    });
  });

  context('isParametersDefinitionsElement', function () {
    context('given ParametersDefinitionsElement instance value', function () {
      specify('should return true', function () {
        const element = new ParametersDefinitionsElement();

        assert.isTrue(isParametersDefinitionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ParametersDefinitionsSubElement extends ParametersDefinitionsElement {}

        assert.isTrue(isParametersDefinitionsElement(new ParametersDefinitionsSubElement()));
      });
    });

    context('given non ParametersDefinitionsSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isParametersDefinitionsElement(1));
        assert.isFalse(isParametersDefinitionsElement(null));
        assert.isFalse(isParametersDefinitionsElement(undefined));
        assert.isFalse(isParametersDefinitionsElement({}));
        assert.isFalse(isParametersDefinitionsElement([]));
        assert.isFalse(isParametersDefinitionsElement('string'));
      });
    });
  });

  context('isResponsesDefinitionsElement', function () {
    context('given ResponsesDefinitionsElement instance value', function () {
      specify('should return true', function () {
        const element = new ResponsesDefinitionsElement();

        assert.isTrue(isResponsesDefinitionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ResponsesDefinitionsSubElement extends ResponsesDefinitionsElement {}

        assert.isTrue(isResponsesDefinitionsElement(new ResponsesDefinitionsSubElement()));
      });
    });

    context('given non ResponsesDefinitionsSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isResponsesDefinitionsElement(1));
        assert.isFalse(isResponsesDefinitionsElement(null));
        assert.isFalse(isResponsesDefinitionsElement(undefined));
        assert.isFalse(isResponsesDefinitionsElement({}));
        assert.isFalse(isResponsesDefinitionsElement([]));
        assert.isFalse(isResponsesDefinitionsElement('string'));
      });
    });
  });

  context('isSecurityDefinitionsElement', function () {
    context('given SecurityDefinitionsElement instance value', function () {
      specify('should return true', function () {
        const element = new SecurityDefinitionsElement();

        assert.isTrue(isSecurityDefinitionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SecurityDefinitionsSubElement extends SecurityDefinitionsElement {}

        assert.isTrue(isSecurityDefinitionsElement(new SecurityDefinitionsSubElement()));
      });
    });

    context('given non SecurityDefinitionsSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSecurityDefinitionsElement(1));
        assert.isFalse(isSecurityDefinitionsElement(null));
        assert.isFalse(isSecurityDefinitionsElement(undefined));
        assert.isFalse(isSecurityDefinitionsElement({}));
        assert.isFalse(isSecurityDefinitionsElement([]));
        assert.isFalse(isSecurityDefinitionsElement('string'));
      });
    });
  });

  context('isSecuritySchemeElement', function () {
    context('given SecuritySchemeElement instance value', function () {
      specify('should return true', function () {
        const element = new SecuritySchemeElement();

        assert.isTrue(isSecuritySchemeElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SecuritySchemeSubElement extends SecuritySchemeElement {}

        assert.isTrue(isSecuritySchemeElement(new SecuritySchemeSubElement()));
      });
    });

    context('given non SecuritySchemeSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSecuritySchemeElement(1));
        assert.isFalse(isSecuritySchemeElement(null));
        assert.isFalse(isSecuritySchemeElement(undefined));
        assert.isFalse(isSecuritySchemeElement({}));
        assert.isFalse(isSecuritySchemeElement([]));
        assert.isFalse(isSecuritySchemeElement('string'));
      });
    });
  });

  context('isScopesElement', function () {
    context('given ScopesElement instance value', function () {
      specify('should return true', function () {
        const element = new ScopesElement();

        assert.isTrue(isScopesElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ScopesSubElement extends ScopesElement {}

        assert.isTrue(isScopesElement(new ScopesSubElement()));
      });
    });

    context('given non ScopesSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isScopesElement(1));
        assert.isFalse(isScopesElement(null));
        assert.isFalse(isScopesElement(undefined));
        assert.isFalse(isScopesElement({}));
        assert.isFalse(isScopesElement([]));
        assert.isFalse(isScopesElement('string'));
      });
    });
  });

  context('isSecurityRequirementElement', function () {
    context('given SecurityRequirementElement instance value', function () {
      specify('should return true', function () {
        const element = new SecurityRequirementElement();

        assert.isTrue(isSecurityRequirementElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SecurityRequirementSubElement extends SecurityRequirementElement {}

        assert.isTrue(isSecurityRequirementElement(new SecurityRequirementSubElement()));
      });
    });

    context('given non SecurityRequirementSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSecurityRequirementElement(1));
        assert.isFalse(isSecurityRequirementElement(null));
        assert.isFalse(isSecurityRequirementElement(undefined));
        assert.isFalse(isSecurityRequirementElement({}));
        assert.isFalse(isSecurityRequirementElement([]));
        assert.isFalse(isSecurityRequirementElement('string'));
      });
    });
  });
});
