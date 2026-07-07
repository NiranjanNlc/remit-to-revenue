# Dependency Direction & SOLID

## Dependency direction
- Domain/business logic must not import infrastructure (DB clients, HTTP
  frameworks, third-party SDKs). Infrastructure depends on domain, never
  the reverse.
- Define interfaces (ports) in the domain layer; implement them
  (adapters) in the infrastructure layer. The domain owns the contract.
- If you find a domain file importing a database driver or an HTTP
  library, that's the dependency pointing the wrong way — invert it with
  an interface.

## SOLID, applied practically (not as trivia)
- **Single Responsibility**: a module/class should have one reason to
  change. If describing what it does requires "and", it's doing two jobs.
- **Open/Closed**: prefer adding new implementations of an interface over
  modifying existing branching logic (switch/if-chains that grow with
  every new case are a smell).
- **Liskov Substitution**: any implementation of an interface must be
  swappable without breaking callers' expectations — don't narrow
  preconditions or weaken postconditions in a subclass/implementation.
- **Interface Segregation**: don't force a consumer to depend on methods
  it doesn't use — split a fat interface into smaller, role-specific ones.
- **Dependency Inversion**: high-level modules depend on abstractions,
  not concrete low-level modules — this is the mechanism behind the
  dependency-direction rule above.

## Interface placement
- Interfaces live next to the consumer (domain layer), not next to the
  implementation (infrastructure layer) — this is what makes the
  dependency point inward.
