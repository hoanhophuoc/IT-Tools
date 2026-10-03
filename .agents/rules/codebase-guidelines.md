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

## Backend (.NET 10 / EF Core)
- **Projections over Mappers**: Prefer direct LINQ `.Select()` projections and C# target-typed `new()` over third-party reflection-based mappers like AutoMapper for simple DTO mapping.
- **No Redundant Include with Projections**: Never add `.Include()` calls when followed by LINQ `.Select()` projections; EF Core generates the necessary SQL joins automatically.
- **Automatic Controller Validation**: Do not write manual `if (!ModelState.IsValid)` checks in controllers marked with `[ApiController]`; ASP.NET Core validates and responds with 400 Bad Request automatically.
- **Existence Queries**: Use `await context.Entities.AnyAsync(...)` instead of `FirstOrDefaultAsync(...) != null` when verifying entity existence.
- **Direct Cryptography Calls**: Call `BCrypt.Net.BCrypt.Verify()` directly at call sites instead of creating wrapper methods with generic catch blocks.
- **Null-Safety on Entities**: Ensure required entity string fields have fallback values (`createDto.Description ?? string.Empty`) when populating entities from DTOs with nullable annotations.
