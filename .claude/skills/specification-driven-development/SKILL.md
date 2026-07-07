---
name: specification-driven-development
description: For larger or ambiguous coding requests (new systems, multi-component features, anything with unclear edge cases or multiple valid interpretations), write a formal specification FIRST — types, contracts, schemas, or interface definitions the implementation must satisfy — before writing implementation code, and verify the code against the spec mechanically (type checker, schema validator, contract tests) rather than by inspection. Trigger on requests like "build a system that...", "design an API for...", "add a module that handles...". Do NOT trigger on small, well-defined fixes, single-function changes, or requests where the behavior is already unambiguous — forcing a formal spec onto a one-line bug fix adds ceremony without value.
---

# Specification-Driven Development

For qualifying requests, produce a formal spec before implementation, and
gate completion on mechanical verification against it — not manual review.

## 1. Write the spec

Before any implementation code, define:
- **Types/schemas** for all data crossing a boundary (function signatures,
  API payloads, DB models) — use the language's actual type system
  (TypeScript types, Python type hints + pydantic, JSON Schema, protobuf)
  not prose descriptions.
- **Contracts**: preconditions, postconditions, and invariants for each
  operation — what must be true going in, what's guaranteed coming out.
- **Explicit edge case handling**: what happens on empty input, concurrent
  access, failure of a dependency — pick a behavior now, not during coding.

Keep the spec in the codebase (e.g. a `.pyi`, a `types.ts`, a schema file),
not just narrated in chat — it needs to be a checkable artifact, not a
description.

## 2. Implement against the spec

Write implementation code that satisfies the spec. If reality forces a
deviation (the spec was wrong or incomplete), update the spec first, then
the code — the spec stays the source of truth, not an artifact that drifts.

## 3. Verify mechanically

Confirm conformance with a tool, not a read-through:
- Type checker (mypy, tsc, etc.) passes with no suppressions
- Schema validation passes on real/sample data
- Contract tests (property-based tests, assertion checks at boundaries)
  exercise the pre/postconditions, not just happy-path behavior

If there's no mechanical checker available for the language/context, say
so explicitly rather than silently falling back to manual inspection —
that's a meaningfully weaker guarantee and the user should know.

See `references/verification-by-language.md` for concrete tool choices per
language/ecosystem.

## Exclusions (from the trigger)
- Small, well-defined, single-function fixes
- Requests with one obvious interpretation and no meaningful edge cases
- User explicitly says to skip this
