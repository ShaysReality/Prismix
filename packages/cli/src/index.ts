#!/usr/bin/env node
import { program } from 'commander';
import { blue, green, yellow } from 'kolorist';
import path from 'node:path';
import fs from 'node:fs/promises';
import { generate } from '@prismix/core';

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
