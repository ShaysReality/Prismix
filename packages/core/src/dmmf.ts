import { getDMMF } from '@prisma/internals';

export async function loadDMMF(schemaSDL: string) {
  return await getDMMF({ datamodel: schemaSDL });
}
