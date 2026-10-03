# Report & Audit Presentation Guidelines

When delivering code audits, multi-file reviews, or refactoring plans:

1. **Visual Structure**: Never output raw, dense blocks of unformatted text or single-line string dumps. Even when tools or skills request "one line per finding" (e.g., `ponytail-audit`, `ponytail-review`), always prioritize readability by rendering findings in a clean GitHub-flavored Markdown table.
2. **Clear Formatting**:
   - Use Markdown tables with explicit columns: `| Tag | What to Cut | Replacement | Location | Est. Cut |`.
   - Highlight tags and key identifiers in bold or backticks (`native`, `delete:`, `yagni`, `reuse`).
   - End with a quantified net impact summary (e.g., `Net Impact: -<N> lines, -<M> deps possible`).
3. **Clickable Links**: Always link to files and symbols using markdown `file://` paths and line anchors. Keep the link text compact and readable using relative paths or basenames (e.g., `[UserController.cs:L18-21](file:///...#L18-L21)` instead of full raw URLs).
