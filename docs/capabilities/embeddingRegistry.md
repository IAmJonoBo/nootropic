## Type Safety and Event Payload Validation (2025+)

- All embedding provider event payloads and data extraction **must** use `Record<string, unknown>` and type guards instead of `any`.
- All payloads must be validated at runtime using Zod or equivalent.
- See CONTRIBUTING.md and onboarding-checklist.md for migration notes and enforcement policy. 