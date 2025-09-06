
[![GitHub stars](https://img.shields.io/github/stars/ShaysReality/Prismix?style=social)](https://github.com/ShaysReality/Prismix)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/ShaysReality/Prismix/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ShaysReality/Prismix/actions/workflows/ci.yml)


# Prismix

Prisma → Zod + JSON Schema + OpenAPI (3.1) codegen.  
Keep validation and API contracts in sync from a single source of truth: `schema.prisma`.

**Current: v0.2.0**  
- Zod inputs: `*CreateInput` / `*UpdateInput`  
- Optional OpenAPI CRUD paths (`emitPaths`)  
- CLI `prismix init` and `--watch`  
- JSON Schema includes enum values and required fields  
- SQLite-friendly mode (`sqliteFriendly`)

---

## Table of contents

- [Why Prismix](#why-prismix)
- [Requirements](#requirements)
- [Install and quickstart](#install-and-quickstart)
- [CLI usage](#cli-usage)
- [Configuration](#configuration)
- [Generated outputs](#generated-outputs)
- [Example Prisma schema](#example-prisma-schema)
- [SQLite notes](#sqlite-notes)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

---

## Why Prismix

- **One schema, many artifacts**: generate Zod, JSON Schema, and OpenAPI from Prisma.  
- **No drift**: re-run the generator whenever your models change.  
- **Simple DX**: small CLI, sensible defaults, Windows-friendly.

---

## Requirements

- Node 18+ (20/22 OK)  
- Prisma 5+  
- A Prisma schema (`schema.prisma`)

---

## Install and quickstart

~~~bash
# from repo root
npm i
npm run generate
~~~

Outputs land in the example at `examples/blog/generated/`.

---

## CLI usage

~~~bash
# create a config in the current directory
prismix init
# or specify paths
prismix init --schema ./prisma/schema.prisma --out ./generated

# one-off generation
prismix generate -c prismix.config.json

# watch schema + config and regenerate on change
prismix generate -c prismix.config.json --watch
~~~

If you prefer the repo scripts:

~~~bash
npm run generate
~~~

---

## Configuration

Create `prismix.config.json`:

~~~json
{
  "schema": "./prisma/schema.prisma",
  "outDir": "./generated",
  "emitInputs": true,
  "emitPaths": true,
  "sqliteFriendly": false
}
~~~

- `emitInputs`: generate `*CreateInput` / `*UpdateInput` Zod types  
- `emitPaths`: add basic CRUD paths to `openapi.json`  
- `sqliteFriendly`: transform enums and list scalars for SQLite

---

## Generated outputs

- **Zod models** → `generated/zod/index.ts`  
- **Zod inputs** → `generated/zod/inputs.ts`  
- **JSON Schema** → `generated/json-schema/*.json`  
- **OpenAPI 3.1** → `generated/openapi.json`  
  If `emitPaths: true`, includes:
  - `GET /{models}`
  - `POST /{models}`
  - `GET /{models}/{id}`
  - `PATCH /{models}/{id}`
  - `DELETE /{models}/{id}`

**Example usage**

~~~ts
import { UserSchema } from "./generated/zod/index";
import { UserCreateInput } from "./generated/zod/inputs";

UserSchema.parse(req.body);
UserCreateInput.parse({
  email: "dev@site.com",
  role: "USER",
  posts: [{ connect: { id: 1 } }]
});
~~~

---

## Example Prisma schema

> Postgres provider so enums and scalar lists work in the example.

~~~prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://user:pass@localhost:5432/prismix_demo"
}

enum Role {
  USER
  ADMIN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  tags      String[]
  createdAt DateTime @default(now())
}
~~~

---

## SQLite notes

SQLite doesn’t support enums or scalar lists.

Options:
- Switch provider to Postgres/MySQL, **or**
- Enable `sqliteFriendly: true`, which converts:
  - enums → `string` (values preserved in JSON Schema)
  - scalar lists → `Json`

Manual alternative for the example:
- `tags String[]` → `tags Json`  
- `role Role` → `role String`

---

## How it works

1. Parse `schema.prisma` via DMMF.  
2. Emit Zod models.  
3. Emit Zod inputs (`*CreateInput` / `*UpdateInput`).  
4. Build JSON Schemas from DMMF (no eval).  
5. Build OpenAPI components (+ optional CRUD paths).

---

## Troubleshooting

**P1012 about enums/lists**  
Using SQLite with enums or list scalars. Switch provider or set `sqliteFriendly: true`.

**“Cannot use import statement outside a module”**  
Everything ships as CommonJS. If you edited builds, keep CJS or rename ESM entrypoints to `.cjs`.

**CLI entry not found**  
Use `packages/cli/dist/index.cjs` or `npm run generate`.

**Windows**  
PowerShell/cmd works. Node 18+ recommended.

---

## Roadmap

- Relation envelope refinements (`connectOrCreate`, `upsert`)  
- Zod shapes for `findUnique` / `findMany` params  
- OpenAPI request/response examples and tags  
- Better pluralization and path naming hooks  
- Per-model include/exclude in config  
- `decimal.js` integration and richer JSON handling  
- VS Code on-save integration

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## Contributing

Issues and PRs welcome. Easy places to start:
- Relation input refinements
- OpenAPI path details (parameters/examples)
- SQLite mapping improvements
- Docs and examples

---

## License

MIT License

Copyright (c) 2025 Shay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

