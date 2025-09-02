# Prismix (MVP v0.1.0)

Prisma → Zod + JSON Schema + OpenAPI. Keep contracts in sync from one source of truth.

⚠️ Early MVP. Enums supported. Relations emitted as `any` for now.

## Quickstart
```bash
npm i
npm -w @prismix/core run build
npm -w @prismix/cli run build

npm run generate
```

Outputs to `examples/blog/generated/`:
- `zod/index.ts`
- `json-schema/*.json`
- `openapi.json`

## Usage
```ts
// zod usage example
import { UserSchema } from './generated/zod/index';
UserSchema.parse(req.body);
```

## Roadmap
- Relations → referenced id shapes + nested connect/create inputs
- Decimal → decimal.js + zod custom
- OpenAPI paths for basic CRUD
- Watch mode + VS Code extension
- GitHub Action to fail on drift

## License
MIT
