import { assert } from 'chai';

import {
  isAsyncApi2Element,
  isAsyncApiVersionElement,
  isChannelItemElement,
  isChannelsElement,
  isComponentsElement,
  isContactElement,
  isIdentifierElement,
  isInfoElement,
  isLicenseElement,
  isParameterElement,
  isReferenceElement,
  isSchemaElement,
  isServerElement,
  isServersElement,
  isServerVariableElement,
  AsyncApi2Element,
  AsyncApiVersionElement,
  ChannelItemElement,
  ChannelsElement,
  ComponentsElement,
  ContactElement,
  IdentifierElement,
  InfoElement,
  LicenseElement,
  ParameterElement,
  ReferenceElement,
  SchemaElement,
  ServerElement,
  ServersElement,
  ServerVariableElement,
} from '../src/index.ts';

describe('predicates', function () {
  context('isAsyncApi2Element', function () {
    context('given AsyncApi2Element instance value', function () {
      specify('should return true', function () {
        const element = new AsyncApi2Element();

        assert.isTrue(isAsyncApi2Element(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class AsyncApi2SubElement extends AsyncApi2Element {}

        assert.isTrue(isAsyncApi2Element(new AsyncApi2SubElement()));
      });
    });

    context('given non AsyncApi2Element instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isAsyncApi2Element(1));
        assert.isFalse(isAsyncApi2Element(null));
        assert.isFalse(isAsyncApi2Element(undefined));
        assert.isFalse(isAsyncApi2Element({}));
        assert.isFalse(isAsyncApi2Element([]));
        assert.isFalse(isAsyncApi2Element('string'));
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

    context('given non SchemaElement instance value', function () {
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

  context('isIdentifierElement', function () {
    context('given IdentifierElement instance value', function () {
      specify('should return true', function () {
        const element = new IdentifierElement();

        assert.isTrue(isIdentifierElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class IdentifierSubElement extends IdentifierElement {}

        assert.isTrue(isIdentifierElement(new IdentifierSubElement()));
      });
    });

    context('given non IdentifierElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isIdentifierElement(1));
        assert.isFalse(isIdentifierElement(null));
        assert.isFalse(isIdentifierElement(undefined));
        assert.isFalse(isIdentifierElement({}));
        assert.isFalse(isIdentifierElement([]));
        assert.isFalse(isIdentifierElement('string'));
      });
    });
  });

  context('isAsyncApiVersionElement', function () {
    context('given AsyncApiVersionElement instance value', function () {
      specify('should return true', function () {
        const element = new AsyncApiVersionElement();

        assert.isTrue(isAsyncApiVersionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class AsyncApiVersionSubElement extends AsyncApiVersionElement {}

        assert.isTrue(isAsyncApiVersionElement(new AsyncApiVersionSubElement()));
      });
    });

    context('given non AsyncApiVersionElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isAsyncApiVersionElement(1));
        assert.isFalse(isAsyncApiVersionElement(null));
        assert.isFalse(isAsyncApiVersionElement(undefined));
        assert.isFalse(isAsyncApiVersionElement({}));
        assert.isFalse(isAsyncApiVersionElement([]));
        assert.isFalse(isAsyncApiVersionElement('string'));
      });
    });
  });

  context('isComponentsElement', function () {
    context('given ComponentsElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsElement();

        assert.isTrue(isComponentsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsSubElement extends ComponentsElement {}

        assert.isTrue(isComponentsElement(new ComponentsSubElement()));
      });
    });

    context('given non ComponentsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsElement(1));
        assert.isFalse(isComponentsElement(null));
        assert.isFalse(isComponentsElement(undefined));
        assert.isFalse(isComponentsElement({}));
        assert.isFalse(isComponentsElement([]));
        assert.isFalse(isComponentsElement('string'));
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

    context('given non InfoElement instance value', function () {
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

    context('given non LicenseElement instance value', function () {
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

    context('given non ContactElement instance value', function () {
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

  context('isServersElement', function () {
    context('given ServersElement instance value', function () {
      specify('should return true', function () {
        const element = new ServersElement();

        assert.isTrue(isServersElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ServersSubElement extends ServersElement {}

        assert.isTrue(isServersElement(new ServersSubElement()));
      });
    });

    context('given non ServersElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isServersElement(1));
        assert.isFalse(isServersElement(null));
        assert.isFalse(isServersElement(undefined));
        assert.isFalse(isServersElement({}));
        assert.isFalse(isServersElement([]));
        assert.isFalse(isServersElement('string'));
      });
    });
  });

  context('isServerElement', function () {
    context('given ServerElement instance value', function () {
      specify('should return true', function () {
        const element = new ServerElement();

        assert.isTrue(isServerElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ServerSubElement extends ServerElement {}

        assert.isTrue(isServerElement(new ServerSubElement()));
      });
    });

    context('given non ServerElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isServerElement(1));
        assert.isFalse(isServerElement(null));
        assert.isFalse(isServerElement(undefined));
        assert.isFalse(isServerElement({}));
        assert.isFalse(isServerElement([]));
        assert.isFalse(isServerElement('string'));
      });
    });
  });

  context('isServerVariableElement', function () {
    context('given ServerVariableElement instance value', function () {
      specify('should return true', function () {
        const element = new ServerVariableElement();

        assert.isTrue(isServerVariableElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ServerVariableSubElement extends ServerVariableElement {}

        assert.isTrue(isServerVariableElement(new ServerVariableSubElement()));
      });
    });

    context('given non ServerVariableElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isServerVariableElement(1));
        assert.isFalse(isServerVariableElement(null));
        assert.isFalse(isServerVariableElement(undefined));
        assert.isFalse(isServerVariableElement({}));
        assert.isFalse(isServerVariableElement([]));
        assert.isFalse(isServerVariableElement('string'));
      });
    });
  });

  context('isChannelsElement', function () {
    context('given ChannelsElement instance value', function () {
      specify('should return true', function () {
        const element = new ChannelsElement();

        assert.isTrue(isChannelsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ChannelsSubElement extends ChannelsElement {}

        assert.isTrue(isChannelsElement(new ChannelsSubElement()));
      });
    });

    context('given non ChannelsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isChannelsElement(1));
        assert.isFalse(isChannelsElement(null));
        assert.isFalse(isChannelsElement(undefined));
        assert.isFalse(isChannelsElement({}));
        assert.isFalse(isChannelsElement([]));
        assert.isFalse(isChannelsElement('string'));
      });
    });
  });

  context('isChannelItemElement', function () {
    context('given ChannelItemElement instance value', function () {
      specify('should return true', function () {
        const element = new ChannelItemElement();

        assert.isTrue(isChannelItemElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ChannelItemSubElement extends ChannelItemElement {}

        assert.isTrue(isChannelItemElement(new ChannelItemSubElement()));
      });
    });

    context('given non ChannelItemElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isChannelItemElement(1));
        assert.isFalse(isChannelItemElement(null));
        assert.isFalse(isChannelItemElement(undefined));
        assert.isFalse(isChannelItemElement({}));
        assert.isFalse(isChannelItemElement([]));
        assert.isFalse(isChannelItemElement('string'));
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

    context('given non ParameterElement instance value', function () {
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

    context('given non ReferenceElement instance value', function () {
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
});
