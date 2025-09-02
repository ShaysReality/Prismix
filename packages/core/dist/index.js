const fs = require('fs/promises');
const path = require('path');
const { loadDMMF } = require('./dmmf');
const { emitZod } = require('./genZod');
const { toJsonSchemasFromDmmf } = require('./genJsonSchema');
const { openapiFromModels } = require('./genOpenAPI');

async function generate(opts) {
  const schemaSDL = await fs.readFile(opts.schemaPath, 'utf8');
  const dmmf = await loadDMMF(schemaSDL);

  const models = dmmf.datamodel.models;
  const enums  = dmmf.datamodel.enums;

  const zodIndex = emitZod(models, enums);
  const jsonSchemas = toJsonSchemasFromDmmf(models);
  const openapi = openapiFromModels(models);

  const zodDir = path.join(opts.outDir, 'zod');
  const jsonDir = path.join(opts.outDir, 'json-schema');
  await fs.mkdir(zodDir, { recursive: true });
  await fs.mkdir(jsonDir, { recursive: true });

  await fs.writeFile(path.join(zodDir, 'index.ts'), zodIndex, 'utf8');
  for (const [name, schema] of Object.entries(jsonSchemas)) {
    await fs.writeFile(path.join(jsonDir, `${name}.json`), JSON.stringify(schema, null, 2), 'utf8');
  }
  await fs.writeFile(path.join(opts.outDir, 'openapi.json'), JSON.stringify(openapi, null, 2), 'utf8');

  return { models: dmmf.datamodel.models.map(m => m.name) };
}
module.exports = { generate };
