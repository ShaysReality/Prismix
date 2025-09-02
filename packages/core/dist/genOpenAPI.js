function openapiFromModels(models) {
  const schemas = {};
  for (const m of models) {
    const props = {};
    for (const f of m.fields) {
      let schema = { type: 'string' };
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
          default: schema = { type: 'string' };
        }
        if (f.isList) schema = { type: 'array', items: schema };
      } else if (f.kind === 'enum') {
        schema = { type: 'string' };
      } else if (f.kind === 'object') {
        schema = {};
      }
      props[f.name] = schema;
    }
    schemas[m.name] = { type: 'object', properties: props, additionalProperties: false };
  }
  const doc = {
    openapi: '3.1.0',
    info: { title: 'Prismix API', version: '0.1.0' },
    paths: {},
    components: { schemas },
  };
  return doc;
}
module.exports = { openapiFromModels };
