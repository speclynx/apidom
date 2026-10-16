import {
  tail,
  compose,
  pathOr,
  map,
  concat,
  transduce,
  pipe,
  trim,
  split,
  join,
  curry,
  replace,
} from 'ramda';
import {
  isInteger,
  trimStart,
  trimEnd,
  isUndefined,
  isEmptyString,
  repeatStr,
  concatRight,
} from 'ramda-adjunct';
import { unraw } from 'unraw';

/**
 * Helpers.
 */

// indentation and chomping indicators may appear in either order (YAML 1.2 §8.1.1)
const blockStyleRegExp = /^(?<style>[|>])(?<indicators>[+-]?[0-9]?|[0-9][+-])(?:\s|$)/;

const getIndentationIndicator = (content: string): number | undefined => {
  const matches = content.match(blockStyleRegExp);
  const indicators: string = pathOr('', ['groups', 'indicators'], matches);
  const indicator = indicators.replace(/[+-]/, '');

  return isEmptyString(indicator) ? undefined : parseInt(indicator, 10);
};

const getIndentation = (content: string): string => {
  const explicitIndentationIndicator = getIndentationIndicator(content);

  // we have explicit indentation indicator
  if (isInteger(explicitIndentationIndicator)) {
    return repeatStr(' ', explicitIndentationIndicator);
  }

  // we assume indentation indicator from first non-empty line (YAML 1.2 §8.1.1.1);
  // with no non-empty line, the first line is used so that its spaces are still stripped
  const lines = tail(content.split('\n'));
  const firstLine = lines.find((line) => !/^ *\r?$/.test(line)) ?? pathOr('', [0], lines);
  const implicitIndentationIndicator = pathOr(
    0,
    ['groups', 'indentation', 'length'],
    firstLine.match(/^(?<indentation>[ ]*)/),
  );
  return repeatStr(' ', implicitIndentationIndicator);
};

// removes the indentation from a content line; a whitespace-only line is an empty line
const deindent =
  (indentation: string) =>
  (line: string): string =>
    /^ *$/.test(line) ? '' : line.slice(Math.min(indentation.length, line.search(/[^ ]/)));

const getChompingIndicator = (content: string): '+' | '-' | undefined => {
  const matches = content.match(blockStyleRegExp);
  const indicators: string = pathOr('', ['groups', 'indicators'], matches);
  const indicator = indicators.replace(/[0-9]/, '');

  return isEmptyString(indicator) ? undefined : (indicator as '+' | '-');
};

const chomp = (indicator: '+' | '-' | undefined, content: string): string => {
  // clip (single newline at end, none for empty content)
  if (isUndefined(indicator)) {
    const trimmed = trimEnd(content);
    return isEmptyString(trimmed) ? '' : `${trimmed}\n`;
  }
  // strip (no newline at end)
  if (indicator === '-') {
    return trimEnd(content);
  }
  // keep (all newlines from end)
  if (indicator === '+') {
    return content;
  }
  return content;
};

/**
 * Normalizes lines breaks.
 * https://yaml.org/spec/1.2/spec.html#line%20break/normalization/
 */
// @ts-ignore
const normalizeLineBreaks = (val: string) => val.replace(/\r\n/g, '\n');

// prevent escaped line breaks from being converted to a space
const preventLineBreakCollapseToSpace = (val: string) => val.replace(/\\\n\s*/g, '');

// collapse line breaks into spaces
const collapseLineBreakToSpace = (val: string) => {
  /**
   * Safari doesn't support negative lookbehind, thus we use mimicking technique:
   *
   * - https://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
   *
   * Ideally we want to use following replace, but that's not currently possible:
   *
   * .replace(/[^\n]\n([^\n]+)/g, (match: string, p1: string) => ` ${p1.trimLeft()}`)
   */
  return val
    .replace(/(\n)?\n([^\n]+)/g, (match, p1, p2) => (p1 ? match : ` ${p2.trimStart()}`))
    .replace(/[\n]{2}/g, '\n');
};

// folds the line break between two lines into a space; empty lines between them stay as line
// breaks, and a line break next to a more-indented line isn't folded (YAML 1.2 §6.5)
const foldLines = (text: string): string => {
  const parts = text.split(/\n(\n*)/); // lines alternating with the empty lines between them
  let folded = parts[0];
  for (let i = 1; i < parts.length; i += 2) {
    const moreIndented = /^[ \t]/.test(parts[i - 1]) || /^[ \t]/.test(parts[i + 1]);
    folded += (moreIndented ? `\n${parts[i]}` : parts[i] || ' ') + parts[i + 1];
  }
  return folded;
};

const removeQuotes = curry((quoteType, val) =>
  val.replace(new RegExp(`^${quoteType}`), '').replace(new RegExp(`${quoteType}$`), ''),
);

/**
 * Formats Flow Scalar Plain style.
 * https://yaml.org/spec/1.2/spec.html#id2788859
 */
export const formatFlowPlain = pipe(
  normalizeLineBreaks,
  trim,
  collapseLineBreakToSpace,
  split('\n'),
  map(trimStart),
  join('\n'),
);

/**
 * Formats Flow Scalar Single-Quoted style.
 * https://yaml.org/spec/1.2/spec.html#id2788097
 */

export const formatFlowSingleQuoted = pipe(
  normalizeLineBreaks,
  trim,
  collapseLineBreakToSpace,
  split('\n'),
  map(trimStart),
  join('\n'),
  removeQuotes("'"),
  replace(/''/g, "'"),
);

/**
 * Formats Flow Scalar Double-Quoted style.
 * https://yaml.org/spec/1.2/spec.html#id2787109
 */
export const formatFlowDoubleQuoted = pipe(
  normalizeLineBreaks,
  trim,
  preventLineBreakCollapseToSpace,
  collapseLineBreakToSpace,
  unraw,
  split('\n'),
  map(trimStart),
  join('\n'),
  removeQuotes('"'),
);

/**
 * Formats Block Scalar Literal style.
 * https://yaml.org/spec/1.2/spec.html#id2795688
 */
export const formatBlockLiteral = (content: string): string => {
  const indentation = getIndentation(content);
  const chompingIndicator = getChompingIndicator(content);
  const normalized = normalizeLineBreaks(content);
  // first line only contains indicators; a final line break ends the last line, it doesn't start a new one
  const lines = tail(normalized.replace(/\n$/, '').split('\n'));
  const transducer = compose(map(deindent(indentation)), map(concatRight('\n')));
  // @ts-ignore
  const deindented: string = transduce(transducer, concat, '', lines);

  return chomp(chompingIndicator, deindented);
};

/**
 * Formats BLock Scalar Folded style.
 * https://yaml.org/spec/1.2/spec.html#id2796251
 */
export const formatBlockFolded = (content: string): string => {
  const indentation = getIndentation(content);
  const chompingIndicator = getChompingIndicator(content);
  const normalized = normalizeLineBreaks(content);
  // first line only contains indicators; a final line break ends the last line, it doesn't start a new one
  const lines = tail(normalized.replace(/\n$/, '').split('\n'));
  const transducer = compose(map(deindent(indentation)), map(concatRight('\n')));
  // @ts-ignore
  const deindented: string = transduce(transducer, concat, '', lines);
  // leading and trailing line breaks are preserved as-is; folding applies only between content lines
  const leadingLineBreaks = deindented.match(/^\n*(?=[^\n])/)?.[0] ?? '';
  const rest = deindented.slice(leadingLineBreaks.length);
  const trailingLineBreaks = rest.match(/\n*$/)![0];
  const collapsed =
    leadingLineBreaks +
    foldLines(rest.slice(0, rest.length - trailingLineBreaks.length)) +
    trailingLineBreaks;

  return chomp(chompingIndicator, collapsed);
};
