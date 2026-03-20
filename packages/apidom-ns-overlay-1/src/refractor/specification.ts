import OverlayVisitor from './visitors/overlay-1/index.ts';
import OverlayOverlayVisitor from './visitors/overlay-1/OverlayVisitor.ts';
import OverlayActionsVisitor from './visitors/overlay-1/ActionsVisitor.ts';
import InfoVisitor from './visitors/overlay-1/info/index.ts';
import InfoVersionVisitor from './visitors/overlay-1/info/VersionVisitor.ts';
import ActionVisitor from './visitors/overlay-1/action/index.ts';
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
            info: {
              $ref: '#/visitors/document/objects/Info',
            },
            extends: { $ref: '#/visitors/value' },
            actions: OverlayActionsVisitor,
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
      },
      extension: {
        $visitor: SpecificationExtensionVisitor,
      },
    },
  },
} as const;

export default specification;
