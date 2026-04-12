import type OverlayError from '../../errors/OverlayError.ts';
import type { OverlayTrace, ActionTraceType } from './types.ts';

export interface ActionStepOptions {
  readonly target: string;
  readonly type: ActionTraceType;
  readonly matchCount: number;
  readonly normalizedPaths: string[];
  readonly success?: boolean;
  readonly error?: OverlayError;
}

/**
 * Collects trace entries during overlay application.
 * Instantiated internally when `options.trace` is provided.
 */
class TraceBuilder {
  #trace: OverlayTrace;

  constructor(trace: OverlayTrace) {
    this.#trace = trace;
    this.#trace.actions = [];
    this.#trace.failed = false;
    this.#trace.failedAt = -1;
    this.#trace.message = 'Overlay was successfully applied';
  }

  action(step: ActionStepOptions): void {
    const { target, type, matchCount, normalizedPaths, success = true, error } = step;
    const position = this.#trace.actions.length;

    this.#trace.actions.push({
      target,
      type,
      matchCount,
      normalizedPaths,
      success,
      ...(error !== undefined ? { error } : {}),
    });

    if (!success) {
      this.#trace.failed = true;
      this.#trace.failedAt = position;
      this.#trace.message = error?.message ?? 'Action failed';
    }
  }
}

export default TraceBuilder;
