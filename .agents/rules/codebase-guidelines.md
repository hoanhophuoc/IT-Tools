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
- **PostgreSQL Case-Insensitive Matching (`external_roslyn:CA1862`)**: Use `EF.Functions.ILike(t.Name, name)` rather than `.ToLower() == .ToLower()` for EF Core database queries.
- **Dedicated Health Check Endpoint**: Map a lightweight `app.MapGet("/healthz", () => Results.Ok("OK"))` endpoint in `Program.cs` to support container orchestrator and Dockerfile health probes without database overhead.
