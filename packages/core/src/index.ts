import fs from 'node:fs/promises';
import path from 'node:path';
import { loadDMMF } from './dmmf';
import { emitZod } from './genZod';
import { toJsonSchemas } from './genJsonSchema';
import { openapiFromModels } from './genOpenAPI';

export type GenerateOptions = {
  schemaPath: string;
  outDir: string;
};

export async function generate(opts: GenerateOptions) {
  const schemaSDL = await fs.readFile(opts.schemaPath, 'utf8');
  const dmmf = await loadDMMF(schemaSDL);

  const zodIndex = emitZod(dmmf.datamodel.models, dmmf.datamodel.enums);
  const jsonSchemas = toJsonSchemas(zodIndex);
  const openapi = openapiFromModels(dmmf.datamodel.models);

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
