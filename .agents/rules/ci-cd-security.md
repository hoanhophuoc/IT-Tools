# CI/CD Security & Code Quality Workflow Guidelines

## SonarCloud / SonarQube with .NET (dotnet-sonarscanner)
- **Do NOT override projectBaseDir**: Never pass `/d:sonar.projectBaseDir="."` to `dotnet-sonarscanner begin`. In Linux CI runners, relative `.` is evaluated from the internal `.sonarqube` directory during `dotnet-sonarscanner end`, causing all source files to be considered out of bounds and failing property generation with:
  `System.InvalidOperationException: File '...' is not located under the base directory '.../.sonarqube'`
- **No sonar-project.properties with dotnet-sonarscanner**: Never create or leave a `sonar-project.properties` file in the repository root if using `dotnet-sonarscanner`. The presence of both causes SonarScanner to abort.
- **Hybrid / Multi-Language Repositories (.NET + TypeScript/JavaScript)**:
  - Use `dotnet-sonarscanner` as the unified scanner rather than running separate scanner steps.
  - Set `/d:sonar.scanner.scanAll=true` in `dotnet-sonarscanner begin`.
  - Ensure both **Java 25+** (`actions/setup-java@v6`) and **Node.js** (`actions/setup-node@v7`) are installed in the runner job so SonarJS can analyze frontend files.
  - Exclude build outputs: `/d:sonar.exclusions="**/bin/**,**/obj/**,**/node_modules/**,**/.next/**,**/*.spec.js,**/*.test.js"`.
  - **Coverage Exclusions on Uncovered Repositories**: When repositories do not execute automated test suites in CI, always supply `/d:sonar.coverage.exclusions="**"` to `dotnet-sonarscanner begin` to prevent SonarCloud Quality Gate failures on the "Coverage on New Code" condition.

## Trivy Security Scans & SARIF Uploads
- **Output Path Scope**: `aquasecurity/trivy-action` writes output files relative to the repository root (`$GITHUB_WORKSPACE`), even if `defaults.run.working-directory` is specified on the job.
- **SARIF Upload Matching**: Always ensure `github/codeql-action/upload-sarif`'s `sarif_file` parameter matches the exact output path specified in `trivy-action` relative to the workspace root (e.g., `trivy-frontend-results.sarif`, not `<subfolder>/trivy-frontend-results.sarif`).
- **Container Health Checks (`docker:DS-0026`)**: All Dockerfiles must define a `HEALTHCHECK` instruction. For Node.js Alpine images, use `wget -qO- http://localhost:<port>/ || exit 1`. For minimal ASP.NET Debian/Ubuntu images, install `curl` (`apt-get install -y --no-install-recommends curl`) and probe `/healthz` (`curl -f http://localhost:<port>/healthz || exit 1`).
- **No Sample Secrets in Component State (`secrets:jwt-token`)**: Never initialize React component state with hardcoded JWT tokens or credential strings (e.g., in `JwtParser.jsx`), as Trivy and Gitleaks flag them in both source files and compiled Next.js build chunks (`.next/**`).

## Action Versions & Deprecation Policy
- **Default to Latest Action Versions**: When authoring or updating GitHub Actions workflows, always use the latest major releases rather than legacy defaults:
  - Checkout: `actions/checkout@v7`
  - Node.js setup: `actions/setup-node@v7`
  - .NET setup: `actions/setup-dotnet@v6`
  - Java setup: `actions/setup-java@v6`
  - Gitleaks: `gitleaks/gitleaks-action@v3`
  - CodeQL: `github/codeql-action/*@v4`
- **CodeQL with .NET 10**: For C# projects targeting `net10.0`, always run `actions/setup-dotnet@v6` with `dotnet-version: '10.0.x'` prior to `github/codeql-action/init@v4` so compilation and reference extraction succeed.

## SonarCloud / SonarQube SAST Guardrails
- **Action Dependency Pinning (`githubactions:S7637`)**: Third-party GitHub Actions (e.g., `gitleaks-action`, `trivy-action`, `react-doctor`) must be pinned by full commit SHA with a version comment:
  `uses: gitleaks/gitleaks-action@ff98106e4c7b2bc287b24eaf42907196329070c7 # v2.3.9`
- **Principle of Least Privilege (`githubactions:S8233`)**: Set default workflow-level permissions to `permissions: contents: read`. Grant `security-events: write` only at the specific job level where SARIF results are uploaded.
- **Supply Chain Script Execution (`githubactions:S6505`, `docker:S6505`, `docker:S8543`)**: Always execute `npm ci --ignore-scripts` in CI pipelines and container builds to prevent untrusted lifecycle scripts from running.
- **Prefer npm scripts over raw npx (`githubactions:S6505`, `githubactions:S8543`)**: In CI workflow steps, do not execute unpinned `npx <tool>` commands (e.g. `npx vitest run --coverage`), which can install on-demand packages and run untrusted lifecycle scripts. Always invoke pre-installed project scripts defined in `package.json` (`npm run <script>`), relying on dependencies pinned and locked via `npm ci --ignore-scripts`.
- **Container Non-Root User (`docker:S6471`)**: Ensure final container stages drop privileges (`USER $APP_UID` in .NET ASP.NET images; `USER node` in Node.js alpine images).
- **No Plaintext Password Hashes in SQL Seeds (`secrets:S8215`)**: Do not hardcode `$2a$` / `$2b$` bcrypt hashes in database initialization scripts (`IT-Tools.sql`). Enable `pgcrypto` (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`) and generate hashes dynamically:
  `crypt('password', gen_salt('bf', 11))`

## Local SonarQube CLI & Scanner Verification
- **Issue Inspection & Quality Gate Verification**:
  - Run `sonar list issues -p <project>` or query `sonar api get "/api/issues/search?projectKeys=<project>&statuses=OPEN,CONFIRMED"` to inspect active issues.
  - Run `sonar quality-gate status -p <project>` to check Quality Gate compliance directly from the terminal.
  - Run `sonar analyze secrets <files...>` targeting specific modified files. Never run `sonar analyze secrets .` without exclusions as traversing `node_modules` causes scanner timeouts.
- **Local Full Scans**:
  - When triggering a local SonarCloud analysis with `dotnet-sonarscanner`, generate a temporary token via `sonar api post "/api/user_tokens/generate?name=<name>"`.
  - Run `dotnet-sonarscanner begin ...`, build the release binary, and execute `dotnet-sonarscanner end /d:sonar.token=...`.
  - Always revoke temporary tokens immediately afterwards (`sonar api post "/api/user_tokens/revoke?name=<name>"`).
  - Ensure `.sonarqube/` is kept in `.gitignore` to prevent scanner metadata from polluting git tracking.

## React Doctor CLI Execution
- **Non-Interactive CI / Agent Scans**: Always pass `-y` / `--yes` (e.g. `npx react-doctor@latest -y --scope full --verbose`) when invoking React Doctor in automated or terminal workflows to prevent interactive prompt hangs.
