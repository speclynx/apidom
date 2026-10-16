import { tail, pathOr, pipe, trim, curry, replace } from 'ramda';
import { isInteger, isEmptyString, repeatStr } from 'ramda-adjunct';

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

// splits a block scalar body into deindented content lines and trailing lines (YAML 1.2 §8.1.1.2):
// trailing lines are the whitespace-only lines after the last content line, minus any up to and
// including the last one indented deeper than the block, which are content; without any content
// line, all lines are trailing
const splitBlockScalar = (
  content: string,
  chomping: '+' | '-' | undefined,
): { lines: string[]; trailing: string[] } => {
  const indentation = getIndentation(content).length;
  const normalized = normalizeLineBreaks(content);
  const body = normalized.includes('\n') ? normalized.slice(normalized.indexOf('\n') + 1) : '';
  const lines = body === '' ? [] : body.split('\n');
  const deindent = (line: string): string =>
    line.slice(Math.min(indentation, line.search(/[^ ]|$/)));

  // without keep chomping, trailing whitespace-only lines not indented deeper than the first
  // content line don't belong to the block scalar
  const firstContent = lines.find((line) => /[^ ]/.test(line));
  if (chomping !== '+' && firstContent !== undefined) {
    const contentIndentation = firstContent.search(/[^ ]/);
    while (/^ *$/.test(lines.at(-1)!) && lines.at(-1)!.length <= contentIndentation) lines.pop();
  }

  let chompStart = lines.length;
  while (chompStart > 0 && /^ *$/.test(lines[chompStart - 1])) chompStart -= 1;
  if (chompStart === 0) return { lines: [], trailing: lines.map(deindent) };
  for (let i = lines.length - 1; i >= chompStart; i -= 1) {
    if (lines[i].length > indentation) {
      chompStart = i + 1;
      break;
    }
  }
  return {
    lines: lines.slice(0, chompStart).map(deindent),
    trailing: lines.slice(chompStart).map(deindent),
  };
};

const getChompingIndicator = (content: string): '+' | '-' | undefined => {
  const matches = content.match(blockStyleRegExp);
  const indicators: string = pathOr('', ['groups', 'indicators'], matches);
  const indicator = indicators.replace(/[0-9]/, '');

  return isEmptyString(indicator) ? undefined : (indicator as '+' | '-');
};

const chomp = (
  indicator: '+' | '-' | undefined,
  value: string,
  { lines, trailing }: { lines: string[]; trailing: string[] },
): string => {
  // a block without content is empty, unless keep chomping preserves its line breaks
  if (lines.length === 0) {
    return indicator === '+' && trailing.length > 0
      ? '\n'.repeat(Math.max(1, trailing.length - 1))
      : '';
  }
  // strip (no newline at end)
  if (indicator === '-') return value;
  // keep (trailing lines and a newline at end)
  if (indicator === '+') {
    const kept = value + trailing.map((line) => `\n${line}`).join('');
    return kept.endsWith('\n') ? kept : `${kept}\n`;
  }
  // clip (single newline at end)
  return `${value}\n`;
};

/**
 * Normalizes lines breaks.
 * https://yaml.org/spec/1.2/spec.html#line%20break/normalization/
 */
// @ts-ignore
const normalizeLineBreaks = (val: string) => val.replace(/\r\n/g, '\n');

// folds the line breaks of a flow scalar (YAML 1.2 §6.5, §7.3):
// white space around a line break is dropped, a single line break becomes a space and every
// further one a line break; with escapes (double-quoted style), escape sequences are left for
// unescaping and an escaped line break is dropped together with the next line's indentation
const foldFlowLines = curry((escapes: boolean, text: string): string =>
  text.replace(
    // a white space run not followed by a line break is consumed whole, which keeps the search
    // linear instead of rescanning the run from every position in it
    escapes
      ? /\\(?:\n[ \t]*|[^])|[ \t]*\n(?:[ \t]*\n)*[ \t]*|[ \t]+/g
      : /[ \t]*\n(?:[ \t]*\n)*[ \t]*|[ \t]+/g,
    (match: string) => {
      if (match.startsWith('\\')) return match[1] === '\n' ? '' : match;
      if (!match.includes('\n')) return match;
      const lineBreaks = match.split('\n').length - 1;
      return lineBreaks === 1 ? ' ' : '\n'.repeat(lineBreaks - 1);
    },
  ),
);

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

// escaped characters of YAML 1.2 §5.7, productions [42] to [58]
const escapedCharacters: Record<string, string> = {
  '0': '\u0000', // null
  a: '\u0007', // bell
  b: '\u0008', // backspace
  t: '\u0009', // horizontal tab
  '\t': '\u0009', // horizontal tab
  n: '\u000a', // line feed
  v: '\u000b', // vertical tab
  f: '\u000c', // form feed
  r: '\u000d', // carriage return
  e: '\u001b', // escape
  ' ': '\u0020', // space
  '"': '\u0022', // double quote
  '/': '\u002f', // slash
  '\\': '\u005c', // backslash
  N: '\u0085', // next line
  _: '\u00a0', // non-breaking space
  L: '\u2028', // line separator
  P: '\u2029', // paragraph separator
};

// unescapes the escape sequences of a double-quoted scalar (YAML 1.2 §5.7); an escape sequence
// outside of the spec is kept as-is
const unescapeDoubleQuoted = (text: string): string =>
  text.replace(
    /\\(?:x([0-9a-fA-F]{2})|u([0-9a-fA-F]{4})|U([0-9a-fA-F]{8})|([^]))/g,
    (match: string, x?: string, u?: string, U?: string, char?: string) => {
      const hex = x ?? u ?? U;
      if (hex === undefined) return escapedCharacters[char!] ?? match;
      const codePoint = parseInt(hex, 16);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    },
  );

const removeQuotes = curry((quoteType, val) =>
  val.replace(new RegExp(`^${quoteType}`), '').replace(new RegExp(`${quoteType}$`), ''),
);

/**
 * Formats Flow Scalar Plain style.
 * https://yaml.org/spec/1.2/spec.html#id2788859
 */
export const formatFlowPlain = pipe(normalizeLineBreaks, trim, foldFlowLines(false));

/**
 * Formats Flow Scalar Single-Quoted style.
 * https://yaml.org/spec/1.2/spec.html#id2788097
 */

export const formatFlowSingleQuoted = pipe(
  normalizeLineBreaks,
  trim,
  foldFlowLines(false),
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
  foldFlowLines(true),
  unescapeDoubleQuoted,
  removeQuotes('"'),
);

/**
 * Formats Block Scalar Literal style.
 * https://yaml.org/spec/1.2/spec.html#id2795688
 */
export const formatBlockLiteral = (content: string): string => {
  const chomping = getChompingIndicator(content);
  const split = splitBlockScalar(content, chomping);

  return chomp(chomping, split.lines.join('\n'), split);
};

/**
 * Formats BLock Scalar Folded style.
 * https://yaml.org/spec/1.2/spec.html#id2796251
 */
export const formatBlockFolded = (content: string): string => {
  const chomping = getChompingIndicator(content);
  const split = splitBlockScalar(content, chomping);
  // leading line breaks are preserved as-is; folding applies only between content lines
  const text = split.lines.join('\n');
  const leadingLineBreaks = text.match(/^\n*/)![0];
  const folded = leadingLineBreaks + foldLines(text.slice(leadingLineBreaks.length));

  return chomp(chomping, folded, split);
};
