# IT-Tools Stack Guidelines (.NET 10 & Next.js 16)

## Frontend (Next.js 16 / React 19)
- **Linting & Build Verification**: `next lint` is not supported by the Next.js 16 CLI. Use `next build` to verify production builds and TypeScript/component integrity.
- **Standard Platform APIs First**:
  - Use `new Intl.DisplayNames(['en'], { type: 'region' })` for country names instead of external lookup packages.
  - Use `Intl.DateTimeFormat` or native arithmetic for duration and date strings.
  - Use `String.prototype.normalize('NFD')` and regex for slugification.
- **React Hook Best Practices**: Do not invoke state setters (`setState`) inside `useMemo` callbacks; derive status and validation errors synchronously.

## Backend (.NET 10 / EF Core)
- **Projections over Mappers**: Prefer direct LINQ `.Select()` projections and C# target-typed `new()` over third-party reflection-based mappers like AutoMapper for simple DTO mapping.
- **Null-Safety on Entities**: Ensure required entity string fields have fallback values (`createDto.Description ?? string.Empty`) when populating entities from DTOs with nullable annotations.
