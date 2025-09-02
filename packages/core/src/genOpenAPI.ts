import type { DMMF } from '@prisma/internals';
import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

export function openapiFromModels(models: DMMF.Model[]): OpenAPIObject {
  const schemas: Record<string, SchemaObject> = {};

  for (const m of models) {
    const props: Record<string, SchemaObject> = {};
    for (const f of m.fields) {
      let schema: SchemaObject = { type: 'string' };
      if (f.kind === 'scalar') {
        switch (f.type) {
          case 'Int': schema = { type: 'integer' }; break;
          case 'BigInt': schema = { type: 'integer', format: 'int64' }; break;
          case 'Float':
          case 'Decimal': schema = { type: 'number' }; break;
          case 'Boolean': schema = { type: 'boolean' }; break;
          case 'String': schema = { type: 'string' }; break;
          case 'DateTime': schema = { type: 'string', format: 'date-time' }; break;
          case 'Json': schema = {}; break;
          case 'Bytes': schema = { type: 'string', format: 'byte' }; break;
        }
        if (f.isList) schema = { type: 'array', items: schema };
      } else if (f.kind === 'enum') {
        schema = { type: 'string' };
      } else if (f.kind === 'object') {
        schema = {};
      }
      if (!f.isRequired) schema.nullable = true  # fix below
      props[f.name] = schema;
    }
    schemas[m.name] = { type: 'object', properties: props };
  }

  const doc: OpenAPIObject = {
    openapi: '3.1.0',
    info: { title: 'Prismix API', version: '0.1.0' },
    paths: {},
    components: { schemas },
  };
  return doc;
}
