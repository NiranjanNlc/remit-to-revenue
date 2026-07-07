---
name: clean-code-architecture
description: For new modules, services, or systems (not small edits or bug fixes), enforce clean architecture across three dimensions - dependency direction and SOLID principles, layered/hexagonal separation of concerns (business logic isolated from UI and infrastructure), and code-level readability (naming, function size, nesting depth, duplication). Trigger on requests like "build a new service for...", "create a module that...", "set up a new [feature area]...". Do NOT trigger on single-function edits, bug fixes, or additions to an existing module that already has an established structure — impose new architecture on greenfield work, don't retrofit it uninvited onto code that has its own established conventions.
---

# Clean Code Architecture

For new modules/services/systems, apply structure across three dimensions
before writing implementation code. Not every dimension applies to every
task — judge based on what follows.

## 1. Decide scope
- Single new module inside an existing system → dependency direction
  (`references/dependency-and-solid.md`) matters most; layering is likely
  already set by the surrounding codebase — follow it, don't reinvent it.
- New standalone service/system → all three dimensions apply from the
  start, in this order: layering first (`references/layering.md`) — get
  the boundaries right before there's code to violate them — then
  dependency direction within each layer
  (`references/dependency-and-solid.md`), then readability
  (`references/readability.md`) applies throughout, continuously, not as
  a separate pass.

## 2. Read the relevant reference file(s) for concrete rules
- `references/dependency-and-solid.md` — SOLID principles, dependency
  direction (domain doesn't import infrastructure), interface placement
- `references/layering.md` — layer boundaries, what's allowed to depend
  on what, hexagonal/ports-and-adapters specifics
- `references/readability.md` — naming, function size, nesting,
  duplication thresholds

## 3. Don't over-apply
If the existing codebase already has clear, working conventions that
differ from these (e.g. it's not layered, it's a single-file script by
design), follow the existing convention over this skill's defaults. This
skill is for greenfield judgment calls, not for overriding decisions
already made.
