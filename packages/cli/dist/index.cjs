#!/usr/bin/env node
const { program } = require('commander');
const { blue, green, yellow } = require('kolorist');
const path = require('path');
const fs = require('fs/promises');
const { generate } = require('../../core/dist/index.js'); // relative to workspace

program
  .name('prismix')
  .description('Prisma → Zod + JSON Schema + OpenAPI codegen')
  .version('0.1.0');

program.command('generate')
  .option('-c, --config <path>', 'Path to prismix.config.json', 'prismix.config.json')
  .action(async (opts) => {
    const configPath = path.resolve(process.cwd(), opts.config);
    const cfg = JSON.parse(await fs.readFile(configPath, 'utf8'));
    const schemaPath = path.resolve(path.dirname(configPath), cfg.schema);
    const outDir = path.resolve(path.dirname(configPath), cfg.outDir);

    console.log(blue(`→ Generating from ${schemaPath}`));
    const res = await generate({ schemaPath, outDir });
    console.log(green(`✓ Generated models: ${res.models.join(', ')}`));
    console.log(yellow(`Output: ${outDir}`));
  });

program.parse();
