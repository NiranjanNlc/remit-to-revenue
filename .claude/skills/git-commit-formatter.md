---
name: git-commit-formatter
description: Formats git commit messages according to Conventional Commits specification. Use this when the user asks to commit changes or write a commit message.
---

# Git Commit Formatter

Format all commit messages using the Conventional Commits specification. Apply this automatically whenever committing code.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
Required. Must be one of:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or tooling
- **ci**: Changes to CI/CD configuration

### Scope
Optional. The area of the codebase affected (e.g., `auth`, `api`, `ui`, `database`).

### Subject
Required. Brief description (50 chars or less):
- Imperative mood ("add" not "added" or "adds")
- No period at the end
- Lowercase first letter

### Body
Optional but recommended for non-trivial changes:
- Explain *what* and *why*, not *how*
- Wrap at 72 characters
- Separate from subject with a blank line
- Use bullet points or paragraphs as needed

### Footer
Optional. Reference issues or breaking changes:
- `Fixes #123` or `Closes #456` for issues
- `BREAKING CHANGE: description` for breaking changes

## Examples

### Simple feature
```
feat(auth): add JWT token refresh endpoint
```

### Bug fix with body
```
fix(api): prevent race condition in concurrent requests

Add mutex lock around shared state access to prevent
multiple goroutines from modifying the cache simultaneously.
This resolves the intermittent 500 errors reported in
high-traffic scenarios.

Fixes #1234
```

### Breaking change
```
feat(api)!: change response format for list endpoints

The list endpoint now returns paginated results with
cursor-based navigation instead of offset-based pagination.

BREAKING CHANGE: clients must update to use the new
pagination format with 'next_cursor' field.
```

## When to Apply

- Trigger on any commit the user requests
- Do NOT apply to throwaway/test commits the user explicitly marks as temporary
- Always verify the message follows the spec before committing
