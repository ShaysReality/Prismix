// packages/core/dist/genJsonSchema.js
function jsonSchemaFromField(field, enumMap) {
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
    return schema;
  }

  if (field.kind === 'enum') {
    const values = enumMap.get(field.type) || [];
    schema = { type: 'string', enum: values };
    if (field.isList) schema = { type: 'array', items: { type: 'string', enum: values } };
    return schema;
  }

  if (field.kind === 'object') {
    // relation placeholder
    schema = {};
    if (field.isList) schema = { type: 'array', items: {} };
    return schema;
  }

  return schema;
}

function toJsonSchemasFromDmmf(models, enums) {
  const enumMap = new Map();
  for (const e of enums || []) enumMap.set(e.name, e.values.map(v => v.name));

  const out = {};
  for (const m of models) {
    const props = {};
    const required = [];
    for (const f of m.fields) {
      props[f.name] = jsonSchemaFromField(f, enumMap);
      if (f.isRequired) required.push(f.name);
    }
    const obj = { type: 'object', properties: props, additionalProperties: false };
    if (required.length) obj.required = required;
    out[m.name] = obj;
  }
  return out;
}

module.exports = { toJsonSchemasFromDmmf };
