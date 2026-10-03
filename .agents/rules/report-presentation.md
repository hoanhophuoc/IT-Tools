# Report & Audit Presentation Guidelines

When delivering code audits, multi-file reviews, or refactoring plans:

1. **Visual Structure**: Never output raw, dense blocks of unformatted text or walls of full-URI markdown links. Even in concise or minimalist modes (e.g., `ponytail-review`), always organize findings logically using Markdown tables or structured card blocks.
2. **Clear Formatting**:
   - Use Markdown tables with explicit column headers (e.g., `Location`, `Tag`, `Finding`, `Recommendation`, `Delta`).
   - Highlight tags and key identifiers in bold or backticks (`native`, `delete:`, `yagni`, `reuse`).
   - Include a concise summary at the top with quantified net metrics (e.g., net lines removed, dependencies eliminated).
3. **Clickable Links**: Always link to files and symbols using markdown `file://` paths and line anchors. Keep the link text compact and readable using relative paths or basenames (e.g., `[UserController.cs:L18-21](file:///...#L18-L21)` instead of full raw URLs).
