/**
 * Compile an array of path tokens into a Normalized JSONPath string (RFC 9535).
 *
 * Based on JSONPath.toPathString from jsonpath-plus but with proper escaping
 * for single quotes in member names.
 *
 * @param tokens - Array of path segments (property keys or array indices)
 * @returns Normalized JSONPath string like "$['paths']['/pets']['get'][0]"
 *
 * @example
 * ```typescript
 * compile(['paths', '/pets', 'get']); // "$['paths']['/pets']['get']"
 * compile(['parameters', 0]); // "$['parameters'][0]"
 * compile([]); // "$"
 * compile(["key'with'quotes"]); // "$['key\\'with\\'quotes']"
 * ```
 *
 * @public
 */
export const compile = (tokens: ReadonlyArray<PropertyKey>): string => {
  const n = tokens.length;
  let p = '$';

  for (let i = 0; i < n; i++) {
    const token = tokens[i];
    const tokenStr = String(token);

    // Check if token is numeric (array index)
    if (/^[0-9*]+$/u.test(tokenStr)) {
      p += `[${tokenStr}]`;
    } else {
      // Member name: escape single quotes
      const escaped = tokenStr.replace(/'/g, "\\'");
      p += `['${escaped}']`;
    }
  }

  return p;
};

export default compile;
