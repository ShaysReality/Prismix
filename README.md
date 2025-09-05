# Prismix

Prisma → Zod + JSON Schema + OpenAPI (3.1) codegen.  
Keep validation and API contracts in sync from a single source of truth: `schema.prisma`.

**Current:** `v0.2.0`  
- Zod inputs: `*CreateInput` / `*UpdateInput`  
- Optional OpenAPI CRUD paths (`emitPaths`)  
- `prismix init` and `--watch`  
- JSON Schema includes enum values + required fields  
- SQLite-friendly mode (`sqliteFriendly`)

---

## Table of Contents

- [Why Prismix](#why-prismix)
- [Requirements](#requirements)
- [Install & Quickstart](#install--quickstart)
- [Using the CLI](#using-the-cli)
- [Configuration](#configuration)
- [Generated Outputs](#generated-outputs)
- [Example Prisma Schema](#example-prisma-schema)
- [SQLite Notes](#sqlite-notes)
- [How It Works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

---

## Why Prismix

- **One schema, many artifacts**: generate Zod, JSON Schema, and OpenAPI from Prisma.
- **No drift**: re-run the generator on model changes.
- **Simple DX**: tiny CLI, sensible defaults, Windows-friendly.

---

## Requirements

- Node 18+ (20/22 OK)
- Prisma 5+
- A Prisma schema (`schema.prisma`)

---

## Install & Quickstart

```bash
# from repo root
npm i
npm run generate
Outputs land in the example at examples/blog/generated/.

Using the CLI
bash
Copy code
# create a config in the current directory
prismix init
# or specify paths
prismix init --schema ./prisma/schema.prisma --out ./generated

# one-off generation
prismix generate -c prismix.config.json

# watch schema + config and regenerate on change
prismix generate -c prismix.config.json --watch
If you’re using the repo’s scripts:

bash
Copy code
npm run generate
Configuration
prismix.config.json

json
Copy code
{
  "schema": "./prisma/schema.prisma",
  "outDir": "./generated",
  "emitInputs": true,
  "emitPaths": true,
  "sqliteFriendly": false
}
emitInputs: generate *CreateInput / *UpdateInput Zod types

emitPaths: add basic CRUD paths to openapi.json

sqliteFriendly: transform enums and list scalars for SQLite

Generated Outputs
Zod models → generated/zod/index.ts

Zod inputs → generated/zod/inputs.ts

JSON Schema → generated/json-schema/*.json

OpenAPI 3.1 → generated/openapi.json
If emitPaths: true, includes:

GET /{models}

POST /{models}

GET /{models}/{id}

PATCH /{models}/{id}

DELETE /{models}/{id}

Example usage

ts
Copy code
import { UserSchema } from "./generated/zod/index";
import { UserCreateInput } from "./generated/zod/inputs";

UserSchema.parse(req.body);
UserCreateInput.parse({
  email: "dev@site.com",
  role: "USER",
  posts: [{ connect: { id: 1 } }]
});
Example Prisma Schema
Postgres provider so enums + scalar lists work in the example.

prisma
Copy code
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
SQLite Notes
SQLite doesn’t support enums or scalar lists.

Options:

Switch provider to Postgres/MySQL, or

Enable sqliteFriendly: true, which converts:

enums → string (enum values preserved in JSON Schema)

list scalars → Json

Manual alternative for the example:

tags String[] → tags Json

role Role → role String

How It Works
Parse schema.prisma via DMMF.

Emit Zod models.

Emit Zod inputs (*CreateInput / *UpdateInput).

Build JSON Schemas from DMMF (no eval).

Build OpenAPI components (+ optional CRUD paths).

Troubleshooting
P1012 about enums/lists
Using SQLite with enums or list scalars. Switch provider or set sqliteFriendly: true.

“Cannot use import statement outside a module”
Everything ships as CommonJS. If you edited builds, keep CJS or rename ESM entrypoints to .cjs.

Module not found for CLI entry
Use packages/cli/dist/index.cjs or run npm run generate.

Windows
PowerShell/cmd works. Node 18+ recommended.

Roadmap
Relation envelope refinements (connectOrCreate, upsert)

Zod shapes for findUnique, findMany params

OpenAPI request/response examples + tags

Better pluralization and path naming hooks

Per-model include/exclude in config

decimal.js integration and richer JSON handling

VS Code on-save integration

Changelog
See CHANGELOG.md.

Contributing
Issues and PRs welcome. Areas that are easy to jump into:

Relation input refinements

OpenAPI path details (parameters/examples)

SQLite mapping improvements

Docs & examples

