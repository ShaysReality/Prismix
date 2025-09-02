import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function toJsonSchemas(zodIndex: string) {
  const module = { exports: {} as any };
  const require = (name: string) => {
    if (name === 'zod') return { z };
    throw new Error('Unsupported require: ' + name);
  };
  // eslint-disable-next-line no-new-func
  const fn = new Function('module', 'exports', 'require', zodIndex + '\nreturn module.exports;');
  const exp = fn(module, module.exports, require) as Record<string, any>;

  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(exp)) {
    if (k.endsWith('Schema')) {
      out[k.replace(/Schema$/, '')] = zodToJsonSchema(v, k);
    }
  }
  return out;
}
