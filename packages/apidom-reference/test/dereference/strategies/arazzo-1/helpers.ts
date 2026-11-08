import { cloneShallow, ParseResultElement } from '@speclynx/apidom-datamodel';
import { mediaTypes, WorkflowElement } from '@speclynx/apidom-ns-arazzo-1';

import { dereferenceApiDOM, parse, Reference, ReferenceSet } from '../../../../src/index.ts';

/**
 * Dereferences a single Workflow the way dereferencing of a fragment is done in
 * practice: the fragment is the root of the ReferenceSet, the whole document is
 * registered next to it so that components can be resolved.
 */
export const dereferenceWorkflow = async (
  rootFilePath: string,
  index: number,
  {
    parseResult,
    dereference: dereferenceOptions = {},
    resolve: resolveOptions = {},
  }: {
    parseResult?: ParseResultElement;
    dereference?: Record<string, unknown>;
    resolve?: Record<string, unknown>;
  } = {},
): Promise<any> => {
  const document =
    parseResult ??
    (await parse(rootFilePath, {
      parse: { mediaType: mediaTypes.latest('json') },
    }));
  const workflow = (document.api as any).workflows.get(index) as WorkflowElement;
  const workflowClone = cloneShallow(workflow);
  workflowClone.classes.push('result');
  const refSet = new ReferenceSet();
  refSet
    .add(
      new Reference({
        uri: `${rootFilePath}#fragment`,
        value: new ParseResultElement([workflowClone]),
      }),
    )
    .add(new Reference({ uri: rootFilePath, value: document }));

  return dereferenceApiDOM(workflow, {
    parse: { mediaType: mediaTypes.latest('json') },
    resolve: { baseURI: rootFilePath, ...resolveOptions },
    dereference: { refSet, ...dereferenceOptions },
  });
};
