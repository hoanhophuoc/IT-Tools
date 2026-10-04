# IT-Tools Stack Guidelines (.NET 10 & Next.js 16)

## Frontend (Next.js 16 / React 19)
- **Linting & Build Verification**: `next lint` is not supported by the Next.js 16 CLI. Use `next build` to verify production builds and TypeScript/component integrity.
- **Standard Platform APIs First**:
  - Use `new Intl.DisplayNames(['en'], { type: 'region' })` for country names instead of external lookup packages.
  - Use `Intl.DateTimeFormat` or native arithmetic for duration and date strings.
  - Use `String.prototype.normalize('NFD')` and regex for slugification.
  - Use `new Intl.Locale(navigator.language).region` for browser locale country extraction instead of `.split('-')`.
  - Use `Uint8Array.from(binaryString, (c) => c.charCodeAt(0))` for byte conversions instead of manual loops.
- **React Hook Best Practices**:
  - Do not invoke state setters (`setState`) inside `useMemo` callbacks; derive status and validation errors synchronously.
  - Avoid unnecessary `useMemo` for cheap synchronous string operations (e.g. `encodeURIComponent`, `slugify`); derive directly during render.

- **Fast Refresh & Component File Exports (`react-doctor/only-export-components`)**: Files ending in `.jsx` / `.tsx` that export React components must NOT export non-component objects (such as `createContext()` instances, enums, or utilities). Separate contexts into sibling non-component files (`src/contexts/authContext.js`) and re-import them into provider components.
- **Standard Number APIs (`javascript:S7773`)**: Always use `Number.isNaN`, `Number.isFinite`, `Number.parseInt`, and `Number.parseFloat` instead of global equivalents.
- **Safe Randomness & Identifiers (`javascript:S2245`)**: Use `React.useId()` for DOM element ID generation in UI components, and `crypto.getRandomValues(...)` for numeric random generation instead of `Math.random()`.
- **Backtracking-Safe Regular Expressions (`javascript:S8786`)**: Avoid regex patterns with nested quantifiers or overlapping optional groups. After collapsing multi-character sequences (e.g. `.replace(/[\s-]+/g, "-")`), trim leading and trailing boundaries using non-quantified patterns (`.replace(/^-/, "").replace(/-$/, "")`) instead of `+` quantifiers to eliminate super-linear regex backtracking.
- **Safe HTML Entity Decoding (`js/xss-through-dom`)**: Never use dummy DOM elements with `.innerHTML = str` for HTML entity unescaping, as CodeQL flags any assignment to `innerHTML` from dynamic input as a DOM XSS vulnerability. Use a static dictionary lookup combined with `String.fromCodePoint(Number.parseInt(...))` for decimal and hexadecimal numeric entities.
- **Accessible Form Controls (`javascript:S6853`, `javascript:S6848`)**:
  - Always link `<label>` elements to form controls using `htmlFor` matching the control's `id`.
  - Use semantic `<button type="button">` elements instead of non-semantic clickable elements (`<span onClick=...>`).

## Backend (.NET 10 / EF Core)
- **Projections over Mappers**: Prefer direct LINQ `.Select()` projections and C# target-typed `new()` over third-party reflection-based mappers like AutoMapper for simple DTO mapping.
- **No Redundant Include with Projections**: Never add `.Include()` calls when followed by LINQ `.Select()` projections; EF Core generates the necessary SQL joins automatically.
- **Automatic Controller Validation**: Do not write manual `if (!ModelState.IsValid)` checks in controllers marked with `[ApiController]`; ASP.NET Core validates and responds with 400 Bad Request automatically.
- **Existence Queries**: Use `await context.Entities.AnyAsync(...)` instead of `FirstOrDefaultAsync(...) != null` when verifying entity existence.
- **Direct Cryptography Calls**: Call `BCrypt.Net.BCrypt.Verify()` directly at call sites instead of creating wrapper methods with generic catch blocks.
- **Null-Safety on Entities**: Ensure required entity string fields have fallback values (`createDto.Description ?? string.Empty`) when populating entities from DTOs with nullable annotations.
- **Source-Generated Regex with Timeouts (`csharpsquid:S6444`, `SYSLIB1045`)**: Use `[GeneratedRegex("...", RegexOptions.None, matchTimeoutMilliseconds: 1000)]` partial methods in `partial` classes instead of dynamic `Regex.Replace` without execution timeouts.
- **Asynchronous Host Startup (`csharpsquid:S6966`)**: Use `await app.RunAsync()` instead of synchronous `app.Run()`.
- **DTO Under-posting Protection (`csharpsquid:S6964`)**: Value type input properties on API request DTOs should include the C# `required` modifier and `[JsonRequired]` attribute.
- **PostgreSQL Case-Insensitive Matching (`external_roslyn:CA1862`)**: Use `EF.Functions.ILike(t.Name, name)` or `string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase)` rather than `.ToLower() == .ToLower()` for EF Core database queries and in-memory comparisons.
- **Dedicated Health Check Endpoint**: Map a lightweight `app.MapGet("/healthz", () => Results.Ok("OK"))` endpoint in `Program.cs` to support container orchestrator and Dockerfile health probes without database overhead.

## Testing & Coverage Standards (Vitest & .NET 10)
- **xUnit v3 Async Responsive Cancellation (`external_roslyn:xUnit1051`)**: In async tests, any call to an asynchronous method accepting an optional `CancellationToken` (e.g., `context.SaveChangesAsync`, `FirstOrDefaultAsync`, `CountAsync`, `FindAsync`) must pass `TestContext.Current.CancellationToken` so test cancellations are immediately honored.
- **Unambiguous Type Assertions (`external_roslyn:xUnit2032`)**: Prefer `Assert.IsType<T>(value, exactMatch: false)` over `Assert.IsAssignableFrom<T>(value)`.
- **Reuse Return Values from Assert.Single (`external_roslyn:xUnit2033`)**: When verifying a single-item collection, capture and use the returned item (`var item = Assert.Single(items); Assert.Equal("expected", item.Prop);`) instead of re-indexing with `items[0]`.
- **Static Test Helper Methods (`external_roslyn:CA1822`)**: Mark helper methods in test classes that do not access instance state (such as `CreateContext(string dbName)`) as `static`.
- **No Floating Promises in Node / Audit Scripts (`javascript:S9383`)**: Asynchronous top-level executions in scripts (e.g. `a11y-audit.mjs`) must handle rejections via `.catch(...)` (e.g. `run().catch(console.error);`) or be awaited.
- **Explicit Test Assertions (`javascript:S2699`)**: Every test case (`it(...)` or `test(...)`) must contain at least one explicit assertion (verifying calls, unmounts, or DOM state), including tests that exercise unmount/cleanup or cancellation paths.
- **Vitest DOM Matchers**: When checking for element non-existence without `@testing-library/jest-dom` extended globally, use `.toBeNull()` rather than `.not.toBeInTheDocument()`.
- **Exact Branch Diagnostics via `coverage-final.json`**: When Vitest reports branch coverage < 100%, avoid guessing from line ranges. Query `coverage/coverage-final.json` to inspect `branchMap` and zero-count indices:
  ```bash
  node -e '
  const d = require("./coverage/coverage-final.json");
  const f = Object.keys(d).find(k => k.includes("<FileName>"));
  for (const [id, b] of Object.entries(d[f].branchMap)) {
    d[f].b[id].forEach((c, i) => { if (c === 0) console.log("Uncovered", id, i, b.locations[i]); });
  }'
  ```
- **No Speculative Parameter Defaults in Internal Handlers**: Avoid adding unused default parameters or uncalled branches in private component event handlers (e.g. `allowZero = false`). If a branch cannot be triggered by valid component states, eliminate it rather than maintaining dead branches.
- **Defensive Fallback Coverage**: When implementing binary fallbacks (`foo || []`, `err.message || "Unknown"`), ensure tests exercise both the truthy and falsy/missing property cases to cover both arms of logical expressions.
- **Targeted Vitest Verification**: Always iterate using single test file executions (`npx vitest run <path/to/test.jsx> --coverage`) before executing full project suites.
