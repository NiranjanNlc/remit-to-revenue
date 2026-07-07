# Code-Level Readability

## Naming
- Names should say what something is/does without needing a comment.
  `daysUntilExpiry` beats `d` or `temp`.
- Avoid abbreviations unless they're domain-standard (e.g. `id`, `url`
  are fine; `usrCfgMgr` is not).
- Booleans read as questions: `isValid`, `hasPermission`, not `valid`,
  `permission`.

## Function size
- If a function doesn't fit on one screen (~40-50 lines) without
  scrolling, it's probably doing more than one thing — extract.
- A function should do one thing at one level of abstraction. Mixing
  high-level orchestration with low-level detail in the same function is
  a signal to extract the low-level part.

## Nesting depth
- More than 2-3 levels of nested conditionals/loops is a readability
  problem. Prefer early returns/guard clauses over deep if/else nesting.
- Extract nested logic into a named helper function — the name documents
  what the nested block was doing.

## Duplication
- Two occurrences of near-identical logic: note it, don't necessarily act
  yet (premature abstraction has its own cost).
- Three or more occurrences: extract. At that point the duplication is a
  real maintenance liability, not a coincidence.
- Don't force a shared abstraction over code that looks similar but
  represents genuinely different concepts — that creates false coupling
  that's worse than the duplication it removed.
