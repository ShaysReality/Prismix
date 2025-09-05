// packages/core/dist/index.js
const fs = require('fs/promises');
const path = require('path');
const { loadDMMF } = require('./dmmf');
const { emitZod } = require('./genZod');
const { emitInputs } = require('./genInputs');
const { toJsonSchemasFromDmmf } = require('./genJsonSchema');
const { openapiFromModels } = require('./genOpenAPI');
const { pathsFromModels } = require('./genPaths');

function providerFromSchema(schemaSDL) {
  const m = schemaSDL.match(/datasource\s+\w+\s*{[^}]*provider\s*=\s*"(.*?)"/s);
  return m ? m[1].toLowerCase() : '';
}

function sqliteNormalize(models, enums, enabled) {
  if (!enabled) return { models, enums };
  const out = JSON.parse(JSON.stringify(models));
  for (const m of out) {
    for (const f of m.fields) {
      if (f.kind === 'enum') {
        f.kind = 'scalar';
        f.type = 'String';
      }
      if (f.kind === 'scalar' && f.isList) {
        f.type = 'Json';
        f.isList = false;
      }
    }
  }
  return { models: out, enums };
}

async function generate(opts) {
  const schemaSDL = await fs.readFile(opts.schemaPath, 'utf8');
  const dmmf = await loadDMMF(schemaSDL);

  const provider = providerFromSchema(schemaSDL);
  const rawModels = dmmf.datamodel.models;
  const rawEnums  = dmmf.datamodel.enums;

  const { models, enums } = sqliteNormalize(rawModels, rawEnums, opts.sqliteFriendly || provider === 'sqlite');

  const zodIndex = emitZod(models, enums);
  const jsonSchemas = toJsonSchemasFromDmmf(models, enums);
  const baseOpenapi = openapiFromModels(models);

  if (opts.emitPaths) {
    baseOpenapi.paths = Object.assign({}, baseOpenapi.paths || {}, pathsFromModels(models));
  }

  const zodDir = path.join(opts.outDir, 'zod');
  const jsonDir = path.join(opts.outDir, 'json-schema');
  await fs.mkdir(zodDir, { recursive: true });
  await fs.mkdir(jsonDir, { recursive: true });

  await fs.writeFile(path.join(zodDir, 'index.ts'), zodIndex, 'utf8');

  if (opts.emitInputs) {
    const inputsIndex = emitInputs(models, enums);
    await fs.writeFile(path.join(zodDir, 'inputs.ts'), inputsIndex, 'utf8');
  }

  for (const [name, schema] of Object.entries(jsonSchemas)) {
    await fs.writeFile(path.join(jsonDir, `${name}.json`), JSON.stringify(schema, null, 2), 'utf8');
  }
  await fs.writeFile(path.join(opts.outDir, 'openapi.json'), JSON.stringify(baseOpenapi, null, 2), 'utf8');

  return { models: models.map(m => m.name), provider };
}

module.exports = { generate };
