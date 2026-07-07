# Layering / Hexagonal Architecture

## Standard layers (outside-in)
1. **Presentation/UI** — HTTP handlers, CLI commands, UI components.
   Translates external input into calls on the application layer; no
   business logic here.
2. **Application** — orchestrates use cases, calls domain logic, talks to
   ports. No business rules live here either — this is coordination only.
3. **Domain** — the actual business logic and rules. No knowledge of the
   outside world (no HTTP, no SQL, no framework imports). Pure and
   independently testable.
4. **Infrastructure** — concrete implementations of ports defined by the
   domain: database access, external API clients, file I/O, message
   queues.

## Allowed dependency directions
- Presentation → Application → Domain
- Infrastructure → Domain (implements domain-defined interfaces)
- Domain depends on nothing outside itself.
- Never: Domain → Infrastructure, or Domain → Presentation.

## Hexagonal (ports & adapters) framing
- **Ports**: interfaces defined by the domain/application describing what
  it needs from the outside world (e.g. `UserRepository`,
  `PaymentGateway`).
- **Adapters**: concrete implementations of ports (e.g. `PostgresUserRepository`,
  `StripePaymentGateway`). Swappable without touching domain code.
- New integrations (new DB, new external API) mean writing a new adapter,
  not modifying the domain.

## Practical check
Ask: "if I deleted the infrastructure layer entirely, would the domain
layer still compile/type-check?" If not, the dependency direction is
wrong somewhere.
