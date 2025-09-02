const { getDMMF } = require('@prisma/internals');
async function loadDMMF(schemaSDL) {
  return await getDMMF({ datamodel: schemaSDL });
}
module.exports = { loadDMMF };
