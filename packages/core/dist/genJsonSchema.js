// Generate JSON Schemas directly from Prisma DMMF models (no eval)
function jsonSchemaFromField(field) {
  let schema = { type: 'string' };
  if (field.kind === 'scalar') {
    switch (field.type) {
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
    if (field.isList) schema = { type: 'array', items: schema };
  } else if (field.kind === 'enum') {
    schema = { type: 'string' }; // could include enum values later
    if (field.isList) schema = { type: 'array', items: schema };
  } else if (field.kind === 'object') {
    schema = {}; // relation placeholder
    if (field.isList) schema = { type: 'array', items: schema };
  }
  return schema;
}

function toJsonSchemasFromDmmf(models) {
  const out = {};
  for (const m of models) {
    const props = {};
    const required = [];
    for (const f of m.fields) {
      props[f.name] = jsonSchemaFromField(f);
      if (f.isRequired) required.push(f.name);
    }
    const obj = { type: 'object', properties: props, additionalProperties: false };
    if (required.length) obj.required = required;
    out[m.name] = obj;
  }
  return out;
}

module.exports = { toJsonSchemasFromDmmf };
