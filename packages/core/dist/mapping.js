// Loose typing by design for MVP
function mapScalar(field) {
  const base = field.type;
  const opt = field.isRequired ? '' : '.optional()';
  const isList = field.isList;
  let z = '';
  switch (base) {
    case 'Int': z = 'z.number().int()'; break;
    case 'BigInt': z = 'z.bigint()'; break;
    case 'Float':
    case 'Decimal': z = 'z.number()'; break;
    case 'Boolean': z = 'z.boolean()'; break;
    case 'String': z = 'z.string()'; break;
    case 'DateTime': z = 'z.date()'; break;
    case 'Json': z = 'z.any()'; break;
    case 'Bytes': z = 'z.instanceof(Uint8Array)'; break;
    default: z = 'z.unknown()';
  }
  if (isList) z = `z.array(${z})`;
  return `${z}${opt}`;
}
module.exports = { mapScalar };
