import type OverlayError from '../../errors/OverlayError.ts';

/**
 * @public
 */
export type ActionTraceType = 'update' | 'copy' | 'remove' | 'noop';

/**
 * Trace entry for a single overlay action application.
 *
 * @public
 */
export interface ActionTrace {
  readonly target: string;
  readonly type: ActionTraceType;
  readonly matchCount: number;
  readonly normalizedPaths: string[];
  readonly success: boolean;
  readonly error?: OverlayError;
}

/**
 * Top-level trace container populated during overlay application.
 * Pass as `trace` option — it will be mutated in place.
 *
 * @public
 */
export interface OverlayTrace {
  actions: ActionTrace[];
  failed: boolean;
  failedAt: number;
  message: string;
}
