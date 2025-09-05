#!/usr/bin/env node
const { program } = require('commander');
const { blue, green, yellow, red } = require('kolorist');
const path = require('path');
const fs = require('fs/promises');
const { generate } = require('../../core/dist/index.js');

async function runOnce(cfgPath) {
  const cfg = JSON.parse(await fs.readFile(cfgPath, 'utf8'));
  const schemaPath = path.resolve(path.dirname(cfgPath), cfg.schema);
  const outDir = path.resolve(path.dirname(cfgPath), cfg.outDir);
  console.log(blue(`→ Generating from ${schemaPath}`));
  const res = await generate({
    schemaPath,
    outDir,
    emitInputs: !!cfg.emitInputs,
    emitPaths: !!cfg.emitPaths,
    sqliteFriendly: !!cfg.sqliteFriendly,
  });
  console.log(green(`✓ Generated models: ${res.models.join(', ')}`));
  console.log(yellow(`Output: ${outDir}`));
}

program
  .name('prismix')
  .description('Prisma → Zod + JSON Schema + OpenAPI codegen')
  .version('0.2.0');

program.command('init')
  .description('create prismix.config.json in the current directory')
  .option('-s, --schema <path>', 'Prisma schema path', './prisma/schema.prisma')
  .option('-o, --out <dir>', 'Output directory', './generated')
  .action(async (opts) => {
    const target = path.resolve(process.cwd(), 'prismix.config.json');
    const config = {
      schema: opts.schema,
      outDir: opts.out,
      emitInputs: true,
      emitPaths: false,
      sqliteFriendly: false
    };
    await fs.writeFile(target, JSON.stringify(config, null, 2));
    console.log(green(`created ${target}`));
  });

program.command('generate')
  .option('-c, --config <path>', 'Path to prismix.config.json', 'prismix.config.json')
  .option('-w, --watch', 'Watch schema/config and regenerate on change', false)
  .action(async (opts) => {
    const cfgPath = path.resolve(process.cwd(), opts.config);
    await runOnce(cfgPath);

    if (opts.watch) {
      try {
        const chokidar = require('chokidar');
        console.log(yellow('watching for changes...'));
        const watcher = chokidar.watch([cfgPath]);
        const cfg = JSON.parse(await fs.readFile(cfgPath, 'utf8'));
        watcher.add(path.resolve(path.dirname(cfgPath), cfg.schema));
        watcher.on('change', async () => {
          try { await runOnce(cfgPath); } catch (e) { console.log(red(String(e))); }
        });
      } catch {
        console.log(red('chokidar is not installed. run: npm i chokidar -w prismix-cli'));
      }
    }
  });

program.parse();
