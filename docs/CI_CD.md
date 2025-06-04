Below is an enriched "## CI Pipeline" section that incorporates modern best practices for continuous integration, with citations supporting each point. This can replace or augment the existing header in docs/CI\_CD.md.

## CI Pipeline

The Continuous Integration (CI) pipeline is responsible for automatically verifying every code change pushed to the repository by running a suite of checks—ranging from linting and unit tests to security scans and code coverage reporting—before changes are merged into the mainline branch.

1. **Pre-Commit and Pre-Merge Validation**

   * **Linting**: Enforce consistent coding styles and catch syntax errors early by running language-specific linters (e.g., ESLint for JavaScript/TypeScript, Flake8 or pylint for Python). Integrating linting at the earliest stage (pre-commit hooks) reduces code review overhead and prevents common formatting mistakes [oai\_citation:0‡reddit.com](https://www.reddit.com/r/ExperiencedDevs/comments/1h506x8/what_do_you_put_in_cicd_pipeline_testing/?utm_source=chatgpt.com).
   * **Unit Tests**: Execute fast, isolated tests that cover individual functions or classes. A robust unit test suite helps catch defects immediately after each commit. Prioritise these tests first to provide rapid feedback (~under 2 minutes) and minimise developer wait times [oai\_citation:1‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:2‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).
   * **Integration Tests**: Run tests that verify interactions between modules or services—such as database access, external APIs, or microservice endpoints. These should be parallelised where possible (e.g., using test runners like Jest's concurrency or pytest-xdist) to maintain speed without sacrificing coverage [oai\_citation:3‡harness.io](https://www.harness.io/blog/best-practices-for-awesome-ci-cd?utm_source=chatgpt.com) [oai\_citation:4‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).

2. **Security and Code Quality Gates**

   * **Static Application Security Testing (SAST)**: Integrate tools like Semgrep or CodeQL to scan code for known vulnerability patterns (e.g., SQL injection, XSS) during CI. Automated SAST prevents insecure code from progressing to later stages and can be configured to fail builds on critical severities [oai\_citation:5‡blog.codacy.com](https://blog.codacy.com/ci/cd-pipeline-security-best-practices?utm_source=chatgpt.com) [oai\_citation:6‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).
   * **Dependency Scans**: Automatically audit third-party dependencies for known vulnerabilities (e.g., using Dependabot, Snyk, or Trivy). Configure the CI to fail or raise warnings when high- or critical-severity CVEs are detected [oai\_citation:7‡blog.codacy.com](https://blog.codacy.com/ci/cd-pipeline-security-best-practices?utm_source=chatgpt.com) [oai\_citation:8‡cycode.com](https://cycode.com/blog/ci-cd-pipeline-security-best-practices/?utm_source=chatgpt.com).
   * **Code Coverage Measurement**: Use coverage tools (e.g., Istanbul/nyc, coverage.py, JaCoCo) to report test coverage metrics. Enforce minimum coverage thresholds (e.g., 80 % line coverage) as CI gates to ensure that new code is adequately tested [oai\_citation:9‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:10‡harness.io](https://www.harness.io/blog/best-practices-for-awesome-ci-cd?utm_source=chatgpt.com).

3. **Performance-Oriented Test Sequencing**

   * **Fail-Fast and Prioritisation**: Order CI steps so that fast, high-value checks (linting, unit tests) run first. If any of these steps fail, abort subsequent steps to conserve compute resources and provide quicker feedback to the developer [oai\_citation:11‡harness.io](https://www.harness.io/blog/best-practices-for-awesome-ci-cd?utm_source=chatgpt.com) [oai\_citation:12‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).
   * **Parallel Execution**: Execute independent test suites (e.g., unit vs integration vs static analysis) in parallel runners or worker containers. This reduces total CI runtime and prevents bottlenecks when scaling tests for larger codebases [oai\_citation:13‡harness.io](https://www.harness.io/blog/best-practices-for-awesome-ci-cd?utm_source=chatgpt.com) [oai\_citation:14‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com).

4. **Quality-of-Service and Environmental Consistency**

   * **Containerised Test Environments**: Run CI steps inside standardized containers (Docker images). This approach guarantees that tests execute against consistent dependencies (OS packages, language runtimes) and prevents "works on my machine" issues [oai\_citation:15‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).
   * **Clone-of-Production Staging**: For integration or end-to-end tests, use a staging environment that closely mimics production (e.g., same database engine version, identical configuration). Service virtualization or mocked dependencies can simulate third-party APIs when replicating production is cost-prohibitive [oai\_citation:16‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com) [oai\_citation:17‡learn.microsoft.com](https://learn.microsoft.com/en-us/azure/devops/pipelines/architectures/devops-pipelines-baseline-architecture?view=azure-devops\&utm_source=chatgpt.com).

5. **Reporting and Feedback Loops**

   * **Real-Time Notifications**: Configure CI to send build status alerts to developers via chat integrations (e.g., Slack, Microsoft Teams) or email. Quick notifications enable developers to remediate failures promptly [oai\_citation:18‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:19‡harness.io](https://www.harness.io/blog/best-practices-for-awesome-ci-cd?utm_source=chatgpt.com).
   * **Detailed Artifacts**: Upload build artifacts—such as test reports (JUnit XML, HTML coverage reports), security scan results, and linter summaries—to a centralized storage or dashboard (e.g., SonarQube, Codecov). This centralization aids in tracking trends over time and identifying recurring issues [oai\_citation:20‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:21‡medium.com](https://medium.com/%40robert_mcbryde/building-a-best-practice-test-automation-pipeline-with-ci-cd-an-introduction-5a4939bd2c93?utm_source=chatgpt.com).

6. **Optimisation and Maintenance**
   * **Cache Dependencies**: Use caching for language runtime dependencies (e.g., npm, pip, Maven/Gradle) to speed up CI jobs. Proper cache key strategies (e.g., lockfile checksums) ensure cache validity and prevent stale builds [oai\_citation:22‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:23‡quashbugs.com](https://quashbugs.com/blog/building-modern-ci-cd-pipeline?utm_source=chatgpt.com).
   * **Test Impact Analysis**: Employ test selection techniques or "affected tests" logic (e.g., Nx affected, Jest's `--changedSince` flag) to run only tests impacted by a given commit, reducing unnecessary test execution time [oai\_citation:24‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:25‡learn.microsoft.com](https://learn.microsoft.com/en-us/azure/devops/pipelines/architectures/devops-pipelines-baseline-architecture?view=azure-devops\&utm_source=chatgpt.com).
   * **Failover and Resilience**: Implement retry policies for transient CI failures (e.g., network timeouts, service unavailability). Limit retries (e.g., 1–2 attempts) to avoid cascading delays but ensure resilience against flakiness [oai\_citation:26‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:27‡wolk.work](https://www.wolk.work/blog/posts/building-robust-ci-cd-pipelines-best-practices-and-automation?utm_source=chatgpt.com).

***

**References**

* Modern CI pipelines should emphasise fast feedback by running linting and unit tests as early as possible [oai\_citation:28‡reddit.com](https://www.reddit.com/r/ExperiencedDevs/comments/1h506x8/what_do_you_put_in_cicd_pipeline_testing/?utm_source=chatgpt.com) [oai\_citation:29‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).
* Integration tests, although slower, are critical for verifying module interoperability and should be parallelized to reduce total CI time [oai\_citation:30‡harness.io](https://www.harness.io/blog/best-practices-for-awesome-ci-cd?utm_source=chatgpt.com) [oai\_citation:31‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).
* Embedding static analysis tools (Semgrep, CodeQL) within CI helps catch security issues early and prevent costly remediations later [oai\_citation:32‡blog.codacy.com](https://blog.codacy.com/ci/cd-pipeline-security-best-practices?utm_source=chatgpt.com) [oai\_citation:33‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com).
* Containerised and clone-of-production test environments mitigate differences between local and CI execution, reducing "works on my machine" problems [oai\_citation:34‡en.wikipedia.org](https://en.wikipedia.org/wiki/Continuous_integration?utm_source=chatgpt.com) [oai\_citation:35‡learn.microsoft.com](https://learn.microsoft.com/en-us/azure/devops/pipelines/architectures/devops-pipelines-baseline-architecture?view=azure-devops\&utm_source=chatgpt.com).
* Effective caching and test selection (affected tests) can significantly shorten CI durations in large codebases [oai\_citation:36‡zeet.co](https://zeet.co/blog/cicd-pipeline-best-practices?utm_source=chatgpt.com) [oai\_citation:37‡learn.microsoft.com](https://learn.microsoft.com/en-us/azure/devops/pipelines/architectures/devops-pipelines-baseline-architecture?view=azure-devops\&utm_source=chatgpt.com).

Explanation of Citations:
• ￼: Concepts around linting and unit tests as first CI steps (Reddit discussion on pipeline testing).
• ￼: Best practices for fast CI feedback, environment consistency, and testing environments (Wikipedia, "Continuous Integration").
• ￼: General best practices for CI pipelines and testing sequencing (Zeet.co best practices).
• ￼: Recommendations on test prioritisation and parallelisation (Harness blog).
• ￼: Security scanning and SAST integration (Codacy blog on CI/CD security).
• ￼: Test environment replication and service virtualization (Wikipedia, Continuous Integration).
• ￼: Staging environment considerations in CI/CD (Azure Pipelines documentation).
• ￼: General test pipeline planning and caching (Quash blog).
• ￼: Focus on high-impact automation areas and test sequencing (Wolk.blog).
• ￼: Dependency scanning best practices (Cycode article).
• ￼: Test automation strategies (Medium article).
• ￼: Environment cloning advice (Azure Pipelines).
• ￼: Emphasis on caching and test impact analysis (Zeet.co).
• ￼: CI/CD error-prone task identification and resilience strategies (Wolk.blog).

This expanded section can be directly placed under "## CI Pipeline" in docs/CI\_CD.md to ensure a comprehensive, best-practice–driven CI pipeline description.

## CI Pipeline (Nx + pnpm + Nx Cloud)

The CI pipeline uses Nx and pnpm for all tasks. All code uses ESM/NodeNext: all `tsconfig.json` files use `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`; all `package.json` files set `"type": "module"`; all local imports must use explicit `.js` extensions. Vitest (v3.x+) is the primary test runner, with a root `vitest.config.ts` and per-lib configs using `defineProject` and `globals: true`. All test files must contain at least one test suite (placeholder if needed). Mac resource fork files (`._*`) should be deleted from test directories if present.

Key jobs:

* **Lint:** `nx affected --target=lint` (PRs) or `nx run-many --target=lint --all` (main/develop)
* **Type-Check:** `nx affected --target=type-check` or `nx run-many --target=type-check --all`
* **Test:** Matrix/parallelized `nx affected --target=test` or `nx run-many --target=test --all`
* **Build:** `nx affected --target=build` or `nx run-many --target=build --all`
* **E2E:** `nx affected --target=e2e` or `nx run-many --target=e2e --all`

All jobs run in Ubuntu containers with Node 20 and pnpm 8. Nx Cloud is enabled for distributed caching and fast incremental runs. See `.github/workflows/ci.yml` for details.

### Troubleshooting

* If jobs fail with "no matching configuration" or "files ignored", check that only a single root `eslint.config.mjs` exists and all Nx targets are present in each project.
* Always use pnpm and Nx from the repo root; do not use yarn or npm directly.
* If you see ESM/NodeNext import errors, check that all local imports use explicit `.js` extensions and all `package.json` files set `"type": "module"`.
* If you see errors about `._*` files or `Unexpected \x00`, delete Mac resource fork files from your test directories: `find . -name '._*' -delete`.

## Markdown Linting (Docs-as-Code)

* **markdownlint** and **markdownlint-cli2** are used to enforce consistent style and quality across all Markdown documentation in the monorepo (`docs/`, tutorials, component docs, etc.).
* Linting is run via the script: `pnpm lint:md`.
* This script is included as a required step in CI, and optionally as a pre-commit hook (via Husky) to catch issues before they reach CI.
* The configuration is defined in `.markdownlint.jsonc` at the repo root, with rules tailored for docs-as-code workflows (e.g., line length and inline HTML allowed).
* **Troubleshooting:** If you see markdownlint errors in CI or pre-commit, run `pnpm lint:md` locally and fix the reported issues. For rule customization, edit `.markdownlint.jsonc`.
