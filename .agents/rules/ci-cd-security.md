# CI/CD Security & Code Quality Workflow Guidelines

## SonarCloud / SonarQube with .NET (dotnet-sonarscanner)
- **Do NOT override projectBaseDir**: Never pass `/d:sonar.projectBaseDir="."` to `dotnet-sonarscanner begin`. In Linux CI runners, relative `.` is evaluated from the internal `.sonarqube` directory during `dotnet-sonarscanner end`, causing all source files to be considered out of bounds and failing property generation with:
  `System.InvalidOperationException: File '...' is not located under the base directory '.../.sonarqube'`
- **No sonar-project.properties with dotnet-sonarscanner**: Never create or leave a `sonar-project.properties` file in the repository root if using `dotnet-sonarscanner`. The presence of both causes SonarScanner to abort.
- **Hybrid / Multi-Language Repositories (.NET + TypeScript/JavaScript)**:
  - Use `dotnet-sonarscanner` as the unified scanner rather than running separate scanner steps.
  - Set `/d:sonar.scanner.scanAll=true` in `dotnet-sonarscanner begin`.
  - Ensure both **Java 21+** (`actions/setup-java@v5`) and **Node.js** (`actions/setup-node@v4`) are installed in the runner job so SonarJS can analyze frontend files.
  - Exclude build outputs: `/d:sonar.exclusions="**/bin/**,**/obj/**,**/node_modules/**,**/.next/**,**/*.spec.js,**/*.test.js"`.

## Trivy Security Scans & SARIF Uploads
- **Output Path Scope**: `aquasecurity/trivy-action` writes output files relative to the repository root (`$GITHUB_WORKSPACE`), even if `defaults.run.working-directory` is specified on the job.
- **SARIF Upload Matching**: Always ensure `github/codeql-action/upload-sarif`'s `sarif_file` parameter matches the exact output path specified in `trivy-action` relative to the workspace root (e.g., `trivy-frontend-results.sarif`, not `<subfolder>/trivy-frontend-results.sarif`).

## Action Versions & Deprecation Policy
- Avoid downgrading GitHub Actions to older versions to bypass deprecation warnings; use the latest supported action versions (e.g. `actions/setup-java@v5`, `github/codeql-action/upload-sarif@v4`, `actions/checkout@v4`).
