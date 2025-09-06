# Changelog

All notable changes to this project will be documented in this file.  
This project follows [Semantic Versioning](https://semver.org/) and the style of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.2] - 2025-09-05
### Fixed
- CLI → Core local link (`file:../core`) to avoid npm E404
- CommonJS entries + Node engines to prevent ESM/Node 22 errors
- Ignore generated outputs in git


## [0.2.0] - 2025-09-04
### Added
- Relation-aware Zod inputs: `*CreateInput` and `*UpdateInput`.
- Optional OpenAPI CRUD paths when `emitPaths: true` (`GET/POST` on `/models` and `GET/PATCH/DELETE` on `/models/{id}`).
- CLI: `prismix init` to scaffold `prismix.config.json`.
- CLI: `--watch` flag to regenerate on changes.
- Config: `sqliteFriendly` mode to map enums → `string` and list scalars → `Json` for SQLite users.

### Changed
- JSON Schema now includes enum values and `required` arrays derived from DMMF.

### Fixed
- Prebuilt CommonJS artifacts for smoother Windows usage.

### Docs
- README overhaul with working anchors, quickstart, and examples.

[0.2.0]: https://github.com/ShaysReality/Prismix/releases/tag/v0.2.0

### Docs
- CI badge and README tweaks
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
