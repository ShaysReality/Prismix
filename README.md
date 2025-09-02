# Prismix

**Prisma → Zod + JSON Schema + OpenAPI (3.1) codegen.**  
Keep your app’s validation and API contracts in sync from one source of truth: `schema.prisma`.

> **v0.1.1** highlights  
> - JSON Schema is generated **directly from DMMF** (no `eval`)  
> - Example uses **PostgreSQL** provider so **enums** + **scalar lists** work  
> - Prebuilt CLI/Core for a smoother Windows experience

---

## Table of contents

- [What it does](#what-it-does)
- [Requirements](#requirements)
- [Monorepo layout](#monorepo-layout)
- [Install & quickstart (this repo)](#install--quickstart-this-repo)
- [CLI usage in your own app](#cli-usage-in-your-own-app)
- [Configuration](#configuration)
- [Example Prisma schema](#example-prisma-schema)
- [Generated outputs](#generated-outputs)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [SQLite vs Postgres (enums & lists)](#sqlite-vs-postgres-enums--lists)
- [Development (from source)](#development-from-source)
- [CI (GitHub Actions)](#ci-github-actions)
- [Versioning & releases](#versioning--releases)
- [Changelog](#changelog)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What it does

- **Zod**: Generates `z.object()` schemas for each Prisma model.
- **JSON Schema**: Emits per-model JSON Schemas **directly from Prisma DMMF**.
- **OpenAPI 3.1**: Produces `components.schemas` for each model.
- **Zero drift**: Rebuild outputs whenever your models change.
- **Simple CLI**: `prismix generate -c prismix.config.json`.

**Limitations (MVP):**
- Relations in Zod are emitted as `any` (placeholders).
- OpenAPI: components only (no CRUD paths yet).
- Some scalars simplified (e.g., `Decimal` → `number`).

---

## Requirements

- **Node 18+** (Node 20/22 ok)
- **Prisma 5+** (as a dev dependency in your app)
- A **Prisma schema** (`schema.prisma`)

> The example in this repo uses `provider = "postgresql"` to allow enums and scalar lists.

---

## Monorepo layout

.
├─ packages/
│ ├─ core/ # codegen core (CommonJS)
│ └─ cli/ # CLI wrapper (CommonJS)
├─ examples/
│ └─ blog/
│ ├─ prisma/schema.prisma
│ └─ prismix.config.json
└─ generated/ # created by the CLI (zod/, json-schema/, openapi.json)

yaml
Copy code

---

## Install & quickstart (this repo)

```bash
# from repo root
npm i
npm run generate
Outputs land in examples/blog/generated/:

pgsql
Copy code
generated/
  zod/
    index.ts
  json-schema/
    User.json
    Post.json
  openapi.json
CLI usage in your own app
When published to npm:

bash
Copy code
# in your app repo
npm i -D prismix-core
npm i -g prismix-cli       # or: npx prismix-cli …

# config (at your repo root)
echo "{\"schema\":\"./prisma/schema.prisma\",\"outDir\":\"./generated\"}" > prismix.config.json

# run
prismix generate -c prismix.config.json
Use the generated Zod in your code:

ts
Copy code
import { UserSchema } from "./generated/zod/index";
// e.g. validating a request body
UserSchema.parse(req.body);
Configuration
prismix.config.json (paths are relative to the config file)

json
Copy code
{
  "schema": "./prisma/schema.prisma",
  "outDir": "./generated"
}
schema: path to your Prisma schema

outDir: output folder (creates zod/, json-schema/, and openapi.json)

Example Prisma schema
The example uses PostgreSQL so enums + scalar lists work.
If you’re on SQLite, see the FAQ below.

prisma
Copy code
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  // Only used for parsing; no DB connection is made during generation.
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
Generated outputs
Zod → generated/zod/index.ts

JSON Schema → generated/json-schema/*.json

OpenAPI 3.1 → generated/openapi.json

How it works
Parse Prisma schema → DMMF

Emit Zod validators

Convert DMMF → JSON Schema (no eval)

Convert DMMF → OpenAPI components

Troubleshooting
Prisma P1012 (enums/lists)

rust
Copy code
Field "tags" in model "Post" can't be a list…
You defined the enum `Role`. But the current connector does not support enums.
You’re likely on SQLite with enums or scalar lists. Switch provider to Postgres/MySQL, or see the SQLite notes below.

“Cannot use import statement outside a module”
Fixed in v0.1.1 (no eval). If you edited code locally, keep everything CommonJS or add .js extensions for ESM.

“Cannot find module …/dist/index.cjs”
Run npm run generate (prebuilt includes dist). If building from source, run npm run build first.

Windows
Use PowerShell or cmd. Node 18+ recommended. Paths with spaces are ok.

SQLite vs Postgres (enums & lists)
Feature	SQLite	Postgres/MySQL
Enums (enum Role { ... })	❌	✅
Scalar lists (String[])	❌	✅

SQLite workarounds:

Replace tags String[] → tags Json

Replace role Role → role String (or model enums as lookup tables)

Development (from source)
bash
Copy code
npm run build      # builds core & cli
npm run generate   # runs codegen on the example config
Common scripts

npm run build — builds core & cli

npm run generate — runs CLI on examples/blog/prismix.config.json

CI (GitHub Actions)
Included at .github/workflows/ci.yml:

Install

Build

Generate

Upload generated/ as artifact

You can extend to fail on drift by comparing committed generated/ to fresh output.

Versioning & releases
bash
Copy code
# bump versions to 0.1.1
npm version 0.1.1 -w prismix-core
npm version 0.1.1 -w prismix-cli
npm version 0.1.1
npm pkg set dependencies.prismix-core="^0.1.1" -w prismix-cli

# tag + push
git add -A
git commit -m "chore(release): v0.1.1"
git tag v0.1.1
git push origin main --tags

# (optional) publish to npm
npm login
npm publish -w prismix-core --access public
npm publish -w prismix-cli  --access public
Changelog
See the full history in CHANGELOG.md.
Latest (v0.1.1): JSON Schema from DMMF (no eval), Postgres example for enums & lists, prebuilt CJS CLI/Core.

Roadmap
Relation-aware Zod shapes for create/update (connect/create)

OpenAPI CRUD path generation

Decimal refinements (decimal.js) + improved JSON handling

--watch mode & GitHub Action for codegen drift

VS Code extension (on-save generate)

Contributing
PRs and issues welcome! Good first issues:

Relation shapes

OpenAPI paths

Decimal/JSON refinements

Watch mode

Docs examples & GIFs

