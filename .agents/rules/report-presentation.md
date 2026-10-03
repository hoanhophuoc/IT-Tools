# Report & Audit Presentation Guidelines

When delivering code audits, multi-file reviews, or refactoring plans:

1. **Visual Structure**: Never output raw, dense blocks of unformatted text. Group findings logically by theme or impact category.
2. **Clear Formatting**:
   - Use Markdown tables or bullet lists.
   - Highlight tags and key identifiers in bold or backticks (`native`, `delete:`, `yagni`, `reuse`).
   - Include a concise summary at the top with quantified net metrics (e.g., net lines removed, dependencies eliminated).
3. **Clickable Links**: Always link to files and symbols using markdown `file://` paths and line anchors (e.g., `[file.js](file:///absolute/path/to/file.js#L10)`).
