import path from 'node:path';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { propEq } from 'ramda';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { dereference, options } from './src/configuration/saturated.mjs';

const fileResolver = options.resolve.resolvers.find(propEq('file', 'name'));
fileResolver.fileAllowList = ['*'];

const fixtureDir = '/tmp/adhoc_error_fixtures';
rmSync(fixtureDir, { recursive: true, force: true });
mkdirSync(fixtureDir, { recursive: true });
mkdirSync(path.join(fixtureDir, 'schemas'), { recursive: true });

writeFileSync(path.join(fixtureDir, 'root.yaml'), `openapi: "3.1.0"
info:
  title: Pet Store
  version: "1.0.0"
paths:
  /pets:
    get:
      summary: List pets
      parameters:
        - $ref: "./schemas/pet.yaml#/PetParam"
      responses:
        "200":
          description: OK
  /owners:
    post:
      summary: Create owner
      requestBody:
        $ref: "./schemas/owner.yaml#/OwnerBody"
      responses:
        "201":
          description: Created
  /inventory:
    get:
      summary: Get inventory
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "./schemas/inventory.yaml#/InventorySchema"
`);

writeFileSync(path.join(fixtureDir, 'schemas/pet.yaml'), `PetParam:
  name: petId
  in: path
  required: true
  schema:
    $ref: "./missing-pet-schema.yaml#/Pet"
`);

writeFileSync(path.join(fixtureDir, 'schemas/owner.yaml'), `OwnerBody:
  description: An owner
  content:
    application/json:
      schema:
        $ref: "./does-not-exist.yaml"
`);

writeFileSync(path.join(fixtureDir, 'schemas/inventory.yaml'), `InventorySchema:
  type: object
  properties:
    items:
      $ref: "./items.yaml#/ItemList"
`);

writeFileSync(path.join(fixtureDir, 'schemas/items.yaml'), `ItemList:
  type: array
  items:
    $ref: "./no-such-item.yaml#/Item"
`);

const errors = [];
await dereference(path.join(fixtureDir, 'root.yaml'), {
  parse: { mediaType: mediaTypes.latest('json') },
  dereference: {
    continueOnError: (error) => {
      errors.push(error);
    },
  },
});

const short = (s) => s?.replace(fixtureDir + '/', '') ?? 'unknown';

function formatError(error, index) {
  const lines = [];

  // header
  lines.push(`[${index + 1}] ${short(error.uri)} at #${error.location}`);
  lines.push('');

  // message
  lines.push(`  ${error.cause?.message ?? error.message}`);
  lines.push('');

  // code frame
  if (error.codeFrame) {
    for (const line of error.codeFrame.split('\n').filter(Boolean)) {
      lines.push(`    | ${line}`);
    }
    lines.push('');
  }

  // trace
  if (error.trace.length > 0) {
    for (const hop of error.trace) {
      lines.push(`  referenced from ${short(hop.uri)} at #${hop.location}`);
      if (hop.codeFrame) {
        for (const line of hop.codeFrame.split('\n').filter(Boolean)) {
          lines.push(`    | ${line}`);
        }
      }
    }
  }

  return lines.join('\n');
}

console.log('');
for (let i = 0; i < errors.length; i++) {
  console.log(formatError(errors[i], i));
  if (i < errors.length - 1) console.log('\n' + '─'.repeat(72) + '\n');
}
console.log('');

rmSync(fixtureDir, { recursive: true, force: true });
