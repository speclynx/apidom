#!/usr/bin/env node
/**
 * This script adds // @ts-ignore comments before specific lines in generated .d.ts files
 * to suppress type widening errors that occur when subclasses widen property types.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '../types/apidom-ns-json-schema-draft-6.d.ts');

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Patterns that need // @ts-ignore before them (type widening in subclasses)
const patterns = [
  /^\s+get itemsField\(/,
  /^\s+set itemsField\(/,
  /^\s+get not\(\)/,
  /^\s+set not\(/,
  /^\s+get targetSchema\(/,
  /^\s+set targetSchema\(/,
  /^\s+element: [\w\s|]+Element;\r?$/,
  /^\s+readonly element: [\w\s|]+Element;\r?$/,
];

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const needsIgnore = patterns.some((pattern) => pattern.test(line));

  if (needsIgnore) {
    // Extract leading whitespace from the current line
    const indent = line.match(/^(\s*)/)[1];
    result.push(`${indent}// @ts-ignore`);
  }

  result.push(line);
}

fs.writeFileSync(filePath, result.join('\n'));
console.log(`Added // @ts-ignore comments to ${filePath}`);
