import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  splitting: false,
  sourcemap: true,
  target: 'es2021',
  minify: false,
});