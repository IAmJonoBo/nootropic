# Contributing to nootropic

## How to File an Issue

* Bug reports, feature requests, required template fields

## How to Submit a Pull Request

* Fork-and-pull workflow, branch naming conventions

## Coding Standards

* TypeScript style, commit message format (Conventional Commits)

## Documentation Contributions

* Where docs live, how to update them

## Testing

* Running unit/integration tests, writing new tests

## Local Development

* Setting up local `Temporal` server, `Chroma` index, `Tabby ML`

## Code Reviews & CI Requirements

* Passing `nx lint`, `nx test`, `nx build`

## Developer Friendly Tips

* Debugging Temporal workflows, OTEL logs

## Documentation Standards: Markdown Linting and Formatting

All documentation must pass a two-phase Markdown linting process:

1. **Automated Fixes:**
   * Run `pnpm run clean:md` to auto-fix and check all Markdown files. This runs Prettier, remark-lint, and markdownlint-cli2 in sequence.
   * These run automatically on commit and in CI.
2. **Manual Review:**
   * If any issues remain after `clean:md`, review the output and fix manually (e.g., duplicate headings, broken links, missing alt text).

**Before submitting a PR:**

* Run the full pipeline locally to ensure all documentation passes.
* See [GETTING\_STARTED.md#markdown-linting-and-formatting](./GETTING_STARTED.md#markdown-linting-and-formatting) for details and commands.

***

See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) for community guidelines.
