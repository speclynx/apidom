import OverlayVisitor from './visitors/overlay-1/index.ts';
import OverlayOverlayVisitor from './visitors/overlay-1/OverlayVisitor.ts';
import OverlayActionsVisitor from './visitors/overlay-1/ActionsVisitor.ts';
import InfoVisitor from './visitors/overlay-1/info/index.ts';
import InfoVersionVisitor from './visitors/overlay-1/info/VersionVisitor.ts';
import ActionVisitor from './visitors/overlay-1/action/index.ts';
import ComponentsVisitor from './visitors/overlay-1/components/index.ts';
import ComponentsActionsVisitor from './visitors/overlay-1/components/ActionsVisitor.ts';
import ReusableActionVisitor from './visitors/overlay-1/reusable-action/index.ts';
import ReusableActionReferenceVisitor from './visitors/overlay-1/reusable-action-reference/index.ts';
import ReusableActionReference$RefVisitor from './visitors/overlay-1/reusable-action-reference/$RefVisitor.ts';
import SpecificationExtensionVisitor from './visitors/SpecificationExtensionVisitor.ts';
import FallbackVisitor from './visitors/FallbackVisitor.ts';

/**
 * Specification object allows us to have complete control over visitors
 * when traversing the ApiDOM.
 * Specification also allows us to create amended refractors from
 * existing ones by manipulating it.
 *
 * Note: Specification object allows to use absolute internal JSON pointers.
 */

/**
 * @public
 */
const specification = {
  visitors: {
    value: FallbackVisitor,
    document: {
      objects: {
        Overlay: {
          element: 'overlay1',
          $visitor: OverlayVisitor,
          fixedFields: {
            overlay: {
              element: 'overlay',
              $visitor: OverlayOverlayVisitor,
            },
            $self: { $ref: '#/visitors/value' },
            info: {
              $ref: '#/visitors/document/objects/Info',
            },
            extends: { $ref: '#/visitors/value' },
            actions: OverlayActionsVisitor,
            components: {
              $ref: '#/visitors/document/objects/Components',
            },
          },
        },
        Info: {
          element: 'info',
          $visitor: InfoVisitor,
          fixedFields: {
            title: { $ref: '#/visitors/value' },
            description: { $ref: '#/visitors/value' },
            version: InfoVersionVisitor,
          },
        },
        Action: {
          element: 'action',
          $visitor: ActionVisitor,
          fixedFields: {
            target: { $ref: '#/visitors/value' },
            description: { $ref: '#/visitors/value' },
            update: { $ref: '#/visitors/value' },
            copy: { $ref: '#/visitors/value' },
            remove: { $ref: '#/visitors/value', alias: 'removeField' },
          },
        },
        Components: {
          element: 'components',
          $visitor: ComponentsVisitor,
          fixedFields: {
            actions: ComponentsActionsVisitor,
          },
        },
        ReusableAction: {
          element: 'reusableAction',
          $visitor: ReusableActionVisitor,
          fixedFields: {
            description: { $ref: '#/visitors/value' },
            fields: {
              $ref: '#/visitors/document/objects/Action',
            },
          },
        },
        ReusableActionReference: {
          element: 'reusableActionReference',
          $visitor: ReusableActionReferenceVisitor,
          fixedFields: {
            $ref: ReusableActionReference$RefVisitor,
            target: { $ref: '#/visitors/value' },
            description: { $ref: '#/visitors/value' },
          },
        },
      },
      extension: {
        $visitor: SpecificationExtensionVisitor,
      },
    },
  },
} as const;

export default specification;
