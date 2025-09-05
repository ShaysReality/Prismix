# Changelog

All notable changes to this project will be documented in this file.  
This project follows [Semantic Versioning](https://semver.org/) and the style of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2025-09-05
### Added
- Relation-aware Zod inputs: `*CreateInput` / `*UpdateInput`
- Optional OpenAPI CRUD paths (`emitPaths` in config)
- CLI: `prismix init` and `--watch`

### Improved
- JSON Schema includes enum values and required fields

### SQLite
- `sqliteFriendly` mode: enums → string (enum list kept), scalar lists → Json

## [0.1.1] - 2025-09-02
### Fixed
- Removed runtime `eval` during JSON Schema generation — now generated **directly from Prisma DMMF** (eliminates ESM/CJS issues).
- Example project switched to **PostgreSQL** provider so enums and scalar lists work out of the box.

### Added
- Prebuilt **CommonJS** CLI/Core included in release archives for a smoother Windows experience.
- Expanded README: troubleshooting, SQLite vs Postgres notes, and clearer quickstart steps.

### Changed
- Generators accept **readonly** arrays from Prisma DMMF to avoid TypeScript mutability errors.

## [0.1.0] - 2025-09-01
### Added
- Initial MVP release:
  - Generate **Zod** validators for each Prisma model.
  - Emit **JSON Schema** per model.
  - Produce **OpenAPI 3.1** component schemas.
- Example `blog` project and basic CI workflow.

