# Mechanical Verification by Language/Ecosystem

Concrete tools to use for "verify mechanically" (step 3 of the main skill),
per language. Read only the section relevant to the current task.

## TypeScript / JavaScript
- Types: `tsc --noEmit` with `strict: true`, no `any` escape hatches
- Schema: `zod` or `io-ts` for runtime validation of external data
- Contracts: property-based tests via `fast-check`

## Python
- Types: `mypy --strict` or `pyright`
- Schema: `pydantic` models for data crossing boundaries
- Contracts: property-based tests via `hypothesis`

## Go
- Types: the compiler itself (Go's type system enforces most of this
  already); use explicit interfaces for contracts
- Schema: struct tags + a validator library (e.g. `go-playground/validator`)
- Contracts: table-driven tests covering pre/postconditions explicitly

## Rust
- Types: the compiler + the type system is unusually expressive here —
  encode invariants in types where possible (newtypes, enums) rather than
  runtime checks
- Contracts: `proptest` for property-based testing

## No type system / dynamically-checked-only language
- Fall back to schema validation libraries (e.g. JSON Schema + a validator)
  plus property-based/contract tests as the primary mechanical check
- State explicitly to the user that this is a weaker guarantee than a
  compile-time check
